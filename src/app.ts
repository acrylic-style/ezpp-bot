import dotenv from 'dotenv'
import _fs from 'fs'
import { run } from 'probot'

dotenv.config()

// these depends on env
import { COMMANDS } from './commands'
import * as data from './data'

const repoOwner = process.env.REPO_OWNER as string

if (process.env.ENV === 'development')
  console.log('Running in development mode.')

const checkPermissions = (author_association: string) =>
  author_association.toLowerCase() === 'owner' ||
  author_association.toLowerCase() === 'collaborator'

const checkRepoOwner = (owner: string) => {
  if (process.env.ENV === 'development') return true
  return owner === repoOwner
}

run((app) => {
  // handles commands
  app.on('issue_comment.created', (e) => {
    if (!checkRepoOwner(e.payload.repository.owner.login)) return
    if (/^@ezpp-bot\s+/.test(e.payload.comment.body)) {
      const commandBody = e.payload.comment.body.replace(/^@ezpp-bot\s+/, '')
      if (checkPermissions(e.payload.comment.author_association)) {
        const command = commandBody.split(/\s+/)[0].toLowerCase()
        const args = commandBody.split(/\s+/).slice(1)
        const cmd = COMMANDS[command]
        if (cmd) {
          cmd.execute(
            args,
            async (body) => {
              await e.octokit.issues.createComment({
                ...e.issue(),
                body,
              })
            },
            e.payload.repository,
            e.payload.issue
          )
        }
      }
    }
  })

  /*
  app.on('issues.closed', async (e) => {
    if (!checkRepoOwner(e.payload.repository.owner.login)) return
    const group = (await data.getData()).groups[
      e.payload.repository.id.toString()
    ]
    if (!group) return
    const currentGroup = changelogs.groups.find((e) => e.name === group)
    if (!currentGroup) return
    const label = e.payload.issue.labels.find((s) =>
      s.name.toLowerCase().startsWith('type: ')
    )
    const type = label
      ? (label as Label).description || label.name.replace('type: ', '')
      : 'Misc'
    if (!type) return
    const author = e.payload.issue.user.login
    const owner =
      e.payload.repository.owner.login !== repoOwner
        ? e.payload.repository.owner.login + '/'
        : ''
    const major =
      e.payload.issue.labels.filter((s) => s.name.toLowerCase() === 'major')
        .length > 0
    const entry = {
      category: type,
      message: `${e.payload.issue.title} (${owner}${e.payload.repository.name}#${e.payload.issue.number})`,
      author,
      major,
    }
    if (
      currentGroup.entries[0].entries.find((u) => u.message === entry.message)
    ) {
      return // avoid duplicate entry
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
    console.log('Added new entry:', entry)
    data.saveData(changelogs, changelogPath, 2)
  })
  */

  // creates entry every time a PR was merged
  // message will be the title of the PR
  // also creates pre-version object if needed
  app.on('pull_request.merged', async (e) => {
    if (!checkRepoOwner(e.payload.repository.owner.login)) return
    const group = (await data.getData()).groups[e.payload.repository.id]
    if (!group) return
    const currentGroup = data.changelogs.groups.find((e) => e.name === group)
    if (!currentGroup) return
    const label = e.payload.pull_request.labels.find((s) =>
      s.name.toLowerCase().startsWith('type: ')
    )
    const type = label
      ? (label as Label).description || label.name.replace('type: ', '')
      : 'Misc'
    if (!type) return
    const author = e.payload.pull_request.user.login
    const owner =
      e.payload.repository.owner.login !== repoOwner
        ? e.payload.repository.owner.login + '/'
        : ''
    const major =
      e.payload.pull_request.labels.filter(
        (s) => s.name.toLowerCase() === 'major'
      ).length > 0
    const entry = {
      category: type,
      message: `${e.payload.pull_request.title} (${owner}${e.payload.repository.name}#${e.payload.pull_request.number})`,
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
    console.log('Added new entry:', entry)
    data.saveData(data.changelogs, data.changelogPath, 2)
  })

  // Automatically creates the version
  // If there is a pre version on the front of the array, then that version will be modified instead.
  app.on('release.created', async (e) => {
    if (!checkRepoOwner(e.payload.repository.owner.login)) return
    const group = (await data.getData()).groups[e.payload.repository.id]
    if (!group) return
    const currentGroup = data.changelogs.groups.find((e) => e.name === group)
    if (!currentGroup) return
    const entry = currentGroup.entries[0]
    if (entry.pre) {
      entry.date = Date.now()
      entry.pre = false
      entry.version = (e.payload.release.name as unknown) as string
    } else {
      currentGroup.entries.splice(0, 0, {
        version: (e.payload.release.name as unknown) as string,
        pre: false,
        date: Date.now(),
        entries: [
          {
            category: 'Misc',
            message: 'Minor improvements',
          },
        ],
      })
    }
    data.saveData(data.changelogs, data.changelogPath, 2)
  })
})
