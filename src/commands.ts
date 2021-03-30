import Command from './command'
import SetGroupCommand from './commands/setGroup'
import RemoveGroupCommand from './commands/removeGroup'
import AddEntryCommand from './commands/addEntry'
import RemoveEntryCommand from './commands/removeEntry'

export const COMMANDS: { [command: string]: Command } = {
  addentry: new AddEntryCommand(),
  removeentry: new RemoveEntryCommand(),
  setgroup: new SetGroupCommand(),
  removegroup: new RemoveGroupCommand(),
}
