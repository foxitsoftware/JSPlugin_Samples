const config = require('./.cz-config');

function getMessage(key, fallback) {
    return (config.messages && config.messages[key]) || fallback;
}

function toMultiline(value) {
    if (!value) {
        return value;
    }

    return value
        .split('|')
        .map((part) => part.trim())
        .join('\n');
}

function valueOrDefault(value, fallback) {
    const normalized = (value || '').trim();
    return normalized || fallback;
}

function isAIType(type) {
    return typeof type === 'string' && type.startsWith('[AI]');
}

function buildBody(answers) {
    const bodyLines = [
        '## 任务输入',
        `- Jira 任务单：${valueOrDefault(answers.jiraTask, '无')}`,
        `- 需求描述：${toMultiline(answers.requirement)}`,
    ];

    if (isAIType(answers.type)) {
        bodyLines.push(
            '',
            '## AI 决策摘要',
            `- 理解的需求：${toMultiline(answers.understanding)}`,
            `- 采用方案：${toMultiline(answers.solution)}`,
            `- 放弃的方案：${valueOrDefault(toMultiline(answers.rejected), '无')}`,
            `- 关键假设：${valueOrDefault(toMultiline(answers.assumptions), '无')}`,
            `- 已知风险：${valueOrDefault(toMultiline(answers.risks), '无')}`,
            `- 未覆盖场景：${valueOrDefault(toMultiline(answers.uncovered), '无')}`,
        );
    }

    return bodyLines.join('\n');
}

function buildHeader(answers) {
    const scope = answers.scope ? `(${answers.scope})` : '';
    return `${answers.type}${scope}: ${answers.subject.trim()}`;
}

module.exports = {
    prompter(cz, commit) {
        const questions = [
            {
                type: 'list',
                name: 'type',
                message: getMessage('type', '选择提交类型:'),
                choices: config.types || [],
            },
            {
                type: 'list',
                name: 'scope',
                message: getMessage('scope', '选择作用域:'),
                choices: [
                    ...((config.scopes || []).map((scope) => ({
                        name: scope.name,
                        value: scope.name,
                    }))),
                    ...(config.allowCustomScopes ? [{ name: 'custom', value: '__custom__' }] : []),
                    { name: 'none', value: '' },
                ],
            },
            {
                type: 'input',
                name: 'customScope',
                message: getMessage('customScope', '填写自定义作用域:'),
                when: (answers) => answers.scope === '__custom__',
                filter: (value) => value.trim(),
            },
            {
                type: 'input',
                name: 'subject',
                message: getMessage('subject', '填写简短描述:'),
                validate: (value) => {
                    const length = value.trim().length;
                    if (!length) {
                        return '简短描述不能为空';
                    }

                    if (config.subjectLimit && length > config.subjectLimit) {
                        return `简短描述不能超过 ${config.subjectLimit} 个字符`;
                    }

                    return true;
                },
                filter: (value) => value.trim(),
            },
            {
                type: 'input',
                name: 'jiraTask',
                message: getMessage('jiraTask', '填写 Jira 任务单链接(没有填"无"):'),
                default: '无',
                filter: (value) => value.trim(),
            },
            {
                type: 'input',
                name: 'requirement',
                message: `${getMessage('requirement', '填写需求描述:')} (使用 "|" 换行)`,
                validate: (value) => value.trim() ? true : '需求描述不能为空',
            },
            {
                type: 'input',
                name: 'understanding',
                message: `${getMessage('understanding', '填写理解的需求:')} (使用 "|" 换行)`,
                validate: (value) => value.trim() ? true : '理解的需求不能为空',
                when: (answers) => isAIType(answers.type),
            },
            {
                type: 'input',
                name: 'solution',
                message: `${getMessage('solution', '填写采用方案:')} (使用 "|" 换行)`,
                validate: (value) => value.trim() ? true : '采用方案不能为空',
                when: (answers) => isAIType(answers.type),
            },
            {
                type: 'input',
                name: 'rejected',
                message: `${getMessage('rejected', '填写放弃的方案(默认"无"):')} (使用 "|" 换行)`,
                default: '无',
                when: (answers) => isAIType(answers.type),
            },
            {
                type: 'input',
                name: 'assumptions',
                message: `${getMessage('assumptions', '填写关键假设(默认"无"):')} (使用 "|" 换行)`,
                default: '无',
                when: (answers) => isAIType(answers.type),
            },
            {
                type: 'input',
                name: 'risks',
                message: `${getMessage('risks', '填写已知风险(默认"无"):')} (使用 "|" 换行)`,
                default: '无',
                when: (answers) => isAIType(answers.type),
            },
            {
                type: 'input',
                name: 'uncovered',
                message: `${getMessage('uncovered', '填写未覆盖场景(默认"无"):')} (使用 "|" 换行)`,
                default: '无',
                when: (answers) => isAIType(answers.type),
            },
            {
                type: 'input',
                name: 'footer',
                message: getMessage('footer', '关联Issues(可选):'),
                filter: (value) => value.trim(),
            },
            {
                type: 'confirm',
                name: 'confirmCommit',
                message: getMessage('confirmCommit', '确认提交?'),
                default: true,
            },
        ];

        cz.prompt(questions).then((answers) => {
            if (!answers.confirmCommit) {
                commit(null);
                return;
            }

            if (answers.scope === '__custom__') {
                answers.scope = answers.customScope;
            }

            const header = buildHeader(answers);
            const body = buildBody(answers);
            const footer = answers.footer || '';

            commit(`${header}\n\n${body}${footer ? `\n\n${footer}` : ''}`);
        });
    },
};