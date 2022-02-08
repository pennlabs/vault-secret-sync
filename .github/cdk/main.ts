import dedent from 'ts-dedent';
import { Construct } from 'constructs';
import { App, Job, Stack, Workflow } from 'cdkactions';

export class MyStack extends Stack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const workflow = new Workflow(this, 'publish', {
      name: 'Publish Helm Chart',
      on: {
        push: {
          branches: ['master']
        }
      },
    });

    new Job(workflow, 'publish', {
      runsOn: 'ubuntu-latest',
      steps: [
        {
          uses: 'actions/checkout@v2',
          with: {
            'fetch-depth': 0,
          },
        },
        {
          name: 'Checkout helm-charts repo',
          uses: 'actions/checkout@v2',
          with: {
            repository: 'pennlabs/helm-charts',
            token: '${{ secrets.BOT_GITHUB_PAT }}',
            path: 'helm-charts',
          },
        },
        {
          name: 'Configure git',
          run: dedent`git config --global user.name github-actions
          git config --global user.email github-actions[bot]@users.noreply.github.com`
        },
        {
          name: 'Install helm',
          uses: 'azure/setup-helm@v1',
          with: {
            version: 'v3.7.2',
          },
        },
        {
          name: 'Publish helm chart',
          run: dedent`
          
          # Install chart releaser
          cr_path="$RUNNER_TOOL_CACHE/cr/"
          mkdir -p "$cr_path"
          curl -sSLo cr.tar.gz "https://github.com/helm/chart-releaser/releases/download/v1.3.0/chart-releaser_1.3.0_linux_amd64.tar.gz"
          tar -xzf cr.tar.gz -C "$cr_path"
          rm -f cr.tar.gz
          export PATH="$cr_path:$PATH"
          # publish helm chart
          helm package . --destination .deploy
          cr upload -p .deploy
          cd helm-charts
          mkdir -p .deploy
          cp ../.deploy/* .deploy
          cr index
          git add index.yaml
          git add .deploy
          git commit -m "Release new version"
          git push
          `,
          env: {
            CR_TOKEN: '${{ secrets.BOT_GITHUB_PAT }}',
            CR_OWNER: 'pennlabs',
            CR_GIT_REPO: 'helm-charts',
            CR_PACKAGE_PATH: '.deploy',
            CR_SKIP_EXISTING: 'true',
            CR_PAGES_BRANCH: 'main',
            CR_INDEX_PATH: 'index.yaml',
            CR_CHARTS_REPO: 'https://github.com/pennlabs/helm-charts',
          },
        },
      ],
    });
  }
}

const app = new App();
new MyStack(app, 'cdk');
app.synth();
