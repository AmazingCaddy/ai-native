# Day 3：AI 编程工作流

## 今日目标

- 把编码 Agent 当作可配置、需要审查的工程协作者
- 掌握“探索、计划、实现、验证、Review”的完整循环
- 为项目建立可复用的上下文和完成标准
- 区分单次 Prompt、`AGENTS.md` 与 Skill 的适用范围
- 将一条重复工作流封装成仓库级 Skill
- 让 AI 提升速度，同时保持代码所有权和可回滚性

## 开始前决策题

1. 哪些上下文应该写入仓库规则，哪些只属于单次任务？
2. 什么时候应该先让 Agent 计划，而不是直接编码？
3. 一条流程何时值得从 Prompt 或清单升级为 Skill？

## 6 小时时间表

| 时间 | 内容 |
| --- | --- |
| 00:00–00:25 | 选取一个 60 至 90 分钟可完成的小功能 |
| 00:25–01:05 | 阅读 Codex best practices 和 Prompting |
| 01:05–02:00 | 比较 Prompt、`AGENTS.md`、Skill，并创建仓库级 Skill |
| 02:00–03:00 | 用模糊任务描述完成第一次实验 |
| 03:00–04:30 | 用结构化任务描述重新完成或改进同一功能 |
| 04:30–05:20 | 测试、静态检查、Diff Review 和负面测试 |
| 05:20–06:00 | 对比结果，更新团队 SOP、地图和复盘 |

## 核心内容

### 一个可执行任务至少包含

- Goal：要改变的行为
- Context：相关文件、文档、现有模式和错误
- Constraints：兼容性、安全、范围和不可修改项
- Done when：测试、行为、性能或验收条件

### 推荐循环

1. 让 Agent 读取代码、测试和仓库约定。
2. 对复杂任务先要求计划，并纠正错误假设。
3. 以小增量实现，每个增量都能验证。
4. 运行测试、类型检查、Lint 和真实行为检查。
5. Review Diff，重点寻找遗漏、过度修改、错误处理和安全问题。
6. 对重复发生的错误，更新仓库规则或模板。

### Prompt、`AGENTS.md` 与 Skill

- Prompt：服务于当前任务的一次性目标、上下文和限制。
- `AGENTS.md`：长期适用于仓库或目录的约定、命令和验证要求。
- Skill：可被显式或隐式触发的重复工作流，可包含 `SKILL.md`、脚本和参考资料。

只有当流程重复出现、步骤相对稳定且结果可以验证时，才把它封装成 Skill。不要把所有提示都永久化。

### 不能外包给 Agent 的责任

- 判断需求是否值得做
- 确认数据和权限边界
- 决定架构和长期维护成本
- 审查第三方依赖与许可证
- 对发布结果和风险负责

## 动手实验：模糊任务对比结构化任务

选择主线项目中的一个小功能，例如模型调用记录或健康检查。

第一次只给一句要求。第二次使用 Goal、Context、Constraints 和 Done when，并允许 Agent 先探索和计划。比较：

- 总交互轮数
- 无关改动数量
- 测试覆盖的关键行为
- 人工修复时间
- Diff 是否容易审查

不要为了得到理想结论修改实验记录。

## 主线项目任务

1. 添加适合当前工具的仓库说明文件，记录目录、命令、约定和验证方式。
2. 新增 `docs/task-template.md` 或等价模板。
3. 新增代码 Review 清单，至少覆盖正确性、错误处理、安全、测试和范围。
4. 在 `.agents/skills/` 创建一个开发或 Review Skill，写清触发条件、步骤和完成标准。
5. 用一个真实任务显式调用该 Skill，并记录它是否减少遗漏或交互轮数。
6. 为 Day 2 行动项功能补充单元测试和一个端到端测试。
7. 让编码 Agent Review 当前未提交变更，并人工验证每个发现。
8. 记录一个 Agent 建议正确的案例和一个建议错误的案例。

## 必读资料

- [Codex best practices](https://learn.chatgpt.com/guides/best-practices)
- [Codex prompting](https://learn.chatgpt.com/docs/prompting)
- [Build skills](https://learn.chatgpt.com/docs/build-skills)

选读：[GitHub Copilot best practices](https://docs.github.com/en/copilot/get-started/best-practices)。

## 验收清单

- [ ] 新成员只读仓库说明即可启动和验证项目
- [ ] 任务模板包含 Goal、Context、Constraints 和 Done when
- [ ] 能说明 Prompt、`AGENTS.md` 与 Skill 的边界
- [ ] 仓库 Skill 已在一个真实任务中触发并完成验证
- [ ] 同一功能的两种提示方式有可比较记录
- [ ] Day 2 核心流程有自动化测试
- [ ] 已人工阅读所有 AI 生成的 Diff
- [ ] 能说明测试通过但代码仍可能有问题的三个原因
