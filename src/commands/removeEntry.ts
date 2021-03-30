import Command, { CommandContext } from '../command'
import * as data from '../data'

export default class RemoveEntryCommand extends Command {
  public async run(args: string[], context: CommandContext): Promise<void> {
    const group = (await data.getData()).groups[context.repository.id]
    if (!group) return
    const currentGroup = data.changelogs.groups.find((e) => e.name === group)
    if (!currentGroup) return
    if (args.length === 0 || !args.join(' ').includes(';')) {
      context.createComment(
        ':warning: This command requires 1 (or 2) argument(s) (`@ezpp-bot removeentry <type;message>)'
      )
      return
    }
    const splitted = args.join(' ').split(';')
    const category = splitted[0]
    splitted.shift()
    const author = context.issue.user.login
    const owner =
      context.repository.owner.login !== process.env.REPO_OWNER
        ? context.repository.owner.login + '/'
        : ''
    const message = `${splitted.join(' ')} (${owner}${
      context.repository.name
    }#${context.issue.number})`
    const entry = {
      category,
      message: `${message} (${owner}${context.repository.name}#${context.issue.number})`,
      author,
    }
    if (currentGroup.entries[0].pre) {
      const filtered = currentGroup.entries[0].entries.filter(
        (el) => !(el.category === category && el.message === message)
      )
      if (filtered.length === 0) {
        currentGroup.entries.shift() // remove latest version
        return
      }
      currentGroup.entries[0].entries = filtered
    } else {
      context.createComment(':warning: Changelog entries are empty.')
      return
    }
    console.log('Removed entry via command:', entry)
    data.saveData(data.changelogs, data.changelogPath, 2)
    context.createComment(
      `:heavy_check_mark: Removed entry (if found): \`${category}\`: \`${message} (${owner}${context.repository.name}#${context.issue.number})\``
    )
  }
}
