import Command, { CommandContext } from '../command'
import * as data from '../data'

export default class AddEntryCommand extends Command {
  public async run(args: string[], context: CommandContext): Promise<void> {
    const group = (await data.getData()).groups[context.repository.id]
    if (!group) return
    const currentGroup = data.changelogs.groups.find((e) => e.name === group)
    if (!currentGroup) return
    let major = false
    if (args[0] === 'major') {
      major = true
      args.shift()
    }
    if (args.length === 0 || !args.join(' ').includes(';')) {
      context.createComment(
        ':warning: This command requires 2 arguments (`@ezpp-bot addentry [major] <type;message>)'
      )
      return
    }
    const splitted = args.join(' ').split(';')
    const category = splitted[0]
    splitted.shift()
    const message = splitted.join(' ')
    const author = context.issue.user.login
    const owner =
      context.repository.owner.login !== process.env.REPO_OWNER
        ? context.repository.owner.login + '/'
        : ''
    const entry = {
      category,
      message: `${message} (${owner}${context.repository.name}#${context.issue.number})`,
      author,
      major,
    }
    if (currentGroup.entries[0].pre) {
      currentGroup.entries[0].entries.push(entry)
    } else {
      currentGroup.entries.splice(0, 0, {
        version: 'Unreleased',
        pre: true,
        entries: [entry],
      })
    }
    console.log('Added new entry via command:', entry)
    data.saveData(data.changelogs, data.changelogPath, 2)
    context.createComment(
      `:heavy_check_mark: Added new entry: \`${category}\`: \`${entry.message}\` (major: ${major})`
    )
  }
}
