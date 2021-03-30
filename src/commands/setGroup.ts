import Command, { CommandContext } from '../command'

export default class SetGroupCommand extends Command {
  public run(args: string[], context: CommandContext): void {
    if (args.length === 0) {
      context.createComment(
        ':warning: setgroup requires 1 argument (`@ezpp-bot setgroup <group name>`).'
      )
    } else {
      this.getData()
        .then((data) => {
          data.groups[context.repository.id.toString()] = args[0]
          return data
        })
        .then(this.saveData)
      context.createComment(
        `:heavy_check_mark: Set group of \`${context.repository.full_name}\` to \`${args[0]}\`.`
      )
      console.log(
        `Set group of ${context.repository.full_name} (ID: ${context.repository.id}) to ${args[0]}`
      )
    }
  }
}
