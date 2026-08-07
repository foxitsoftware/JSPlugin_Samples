// .cz-config.js
module.exports = {
    // 类型定义

    // Scope 列表（对应你的模块）
    scopes: [
        { name: 'api' },
        { name: 'docs' },
        { name: 'auth' },
        { name: 'ui' },
        { name: 'utils' },
        { name: 'payment' },
        { name: 'core' },
        { name: 'deps' },
        { name: 'config' }
    ],

    // 关键：使用 typePrefix 模拟 [AI] 标签
    // 但这种方式会把 [AI] 和 type 连在一起，如 [AI]feat
    // 需要配合 subject 手动处理

    // 更实用的方式：添加 AI/CI 作为 type 的一部分
    types: [
        { value: '[AI] feat', name: '[AI] feat:  AI生成-新功能' },
        { value: '[AI] fix', name: '[AI] fix:  AI生成-Bug修复' },
        { value: '[AI] refactor', name: '[AI] refactor: AI生成-重构' },
        { value: '[CI] chore', name: '[CI] chore: CI生成-构建' },
        { value: 'feat', name: 'feat:     人工-新功能' },
        { value: 'fix', name: 'fix:      人工-Bug修复' },
        // ... 其他类型
    ],

    // 覆盖提示文本，引导逐项填写提交信息
    messages: {
        type: '选择提交来源和类型:',
        scope: '选择作用域(模块):',
        customScope: '填写自定义作用域:',
        subject: '填写简短描述(不超过72字符):',
        jiraTask: '填写 Jira 任务单链接(没有填"无"):',
        requirement: '填写需求描述:',
        understanding: '填写理解的需求:',
        solution: '填写采用方案:',
        rejected: '填写放弃的方案(默认"无"):',
        assumptions: '填写关键假设(默认"无"):',
        risks: '填写已知风险(默认"无"):',
        uncovered: '填写未覆盖场景(默认"无"):',
        breaking: '破坏性变更(可选):',
        footer: '关联Issues(可选):',
        confirmCommit: '确认提交?'
    },

    subjectLimit: 72,
    allowCustomScopes: true,
    skipQuestions: ['breaking'] // 根据需要跳过
};