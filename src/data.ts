import _fs from 'fs'
import fs from 'fs/promises'

export type Data = {
  groups: { [id: string]: string }
}

export const changelogPath = process.env.CHANGELOG_PATH as string

export const changelogs = JSON.parse(
  _fs.readFileSync(changelogPath).toString('utf-8')
) as ChangelogData

export const getData = async (): Promise<Data> => {
  if (_fs.existsSync('./data.json')) {
    const unparsed = (await fs.readFile('./data.json')).toString('utf-8')
    const data = unparsed ? (JSON.parse(unparsed) as Data) : { groups: {} }
    if (data && data.groups) return data
  }
  const data = { groups: {} }
  await saveData(data)
  return data
}

export const saveData = (
  data: any,
  path: string = './data.json',
  space: string | number | undefined = undefined
): Promise<void> => fs.writeFile(path, JSON.stringify(data, undefined, space))

getData().then(saveData) // generates the missing data.json
