import Command, { CommandContext } from '../command'

export default class RemoveGroupCommand extends Command {
  public run(_: string[], context: CommandContext): void {
    this.getData()
      .then((data) => {
        delete data.groups[context.repository.id.toString()]
        return data
      })
      .then(this.saveData)
    context.createComment(
      `:heavy_check_mark: Removed group for \`${context.repository.full_name}\`.`
    )
    console.log(
      `Removed group for ${context.repository.full_name} (ID: ${context.repository.id})`
    )
  }
}
