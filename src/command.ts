import * as data from './data'

export type CommandContext = {
  createComment: (body: string) => Promise<void>
  repository: Repository
  issue: Issue
}

export default abstract class Command {
  public getData = data.getData
  public saveData = data.saveData

  public async execute(
    args: string[],
    createComment: (body: string) => Promise<void>,
    repository: Repository,
    issue: Issue
  ): Promise<void> {
    this.run(args, { createComment, repository, issue })
  }

  protected abstract run(args: string[], context: CommandContext): void
}
