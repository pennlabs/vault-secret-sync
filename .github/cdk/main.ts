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
          name: 'Configure git',
          run: dedent`git config user.name github-actions
          git config user.email github-actions[bot]@users.noreply.github.com`
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
          uses: 'helm/chart-releaser-action@v1.3.0',
          with: {
            charts_dir: '.',
            charts_repo_url: 'https://helm.pennlabs.org',
          },
          env: {
            CR_TOKEN: '${{ secrets.BOT_GITHUB_PAT }}',
            CR_OWNER: 'pennlabs',
            CR_GIT_REPO: 'helm-charts',
            // CR_PACKAGE_PATH: '.deploy',
            CR_SKIP_EXISTING: 'true',
            CR_PAGES_BRANCH: 'master',
            CR_INDEX_PATH: 'index.yaml',
          },
        },
      ],
    });
  }
}

const app = new App();
new MyStack(app, 'cdk');
app.synth();
