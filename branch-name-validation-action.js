const core = require('@actions/core');
const github = require('@actions/github');

const validEvent = ['pull_request'];

async function run() {
    try {
        const eventName = github.context.eventName;
        core.info(`Event name: ${eventName}`);
        if (validEvent.indexOf(eventName) < 0) {
            core.setFailed(`Invalid event: ${eventName}`);
            return;
        }

        let branchName = github.context.payload.pull_request.head.ref;
        core.info(`Branch name: ${branchName}`);

        // Check if branch is to be ignored
        const ignoredPrefixes = core.getInput('ignored_prefixes');
        if (ignoredPrefixes.length > 0 && ignoredPrefixes.split(',').some((el) => branchName.startsWith(el.trim()))) {
            core.info(`Skipping checks since ${branchName} is in the ignored list - ${ignoredPrefixes}`);
            return
        }

        // Check min length
        const minLen = parseInt(core.getInput('min_length'));
        if (branchName.length < minLen) {
            core.setFailed(`Branch ${branchName} is shorter than min length specified - ${minLen}`);
            return;
        }

        // Check if branch passes regex
        const regex = RegExp(core.getInput('regex'));
        core.info(`Regex: ${regex}`);
        if (!regex.test(branchName)) {
            core.setFailed(`Branch ${branchName} failed to pass match regex - ${regex}`);
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();