import {exportVariable, info, setFailed} from '@actions/core'
import {ActionInterface, Status, NodeActionInterface} from './constants'
import {deploy, init} from './git'
import {
  generateFolderPath,
  checkParameters,
  generateRepositoryPath,
  generateTokenType
} from './util'

/** Initializes and runs the action.
 *
 * @param {object} configuration - The action configuration.
 */
export default async function run(
  configuration: ActionInterface | NodeActionInterface
): Promise<void> {
  let status: Status = Status.RUNNING

  try {
    info('Checking configuration and starting deployment… 🚦')

    const settings: ActionInterface = {
      ...configuration
    }

    // Defines the repository/folder paths and token types.
    // Also verifies that the action has all of the required parameters.
    settings.folderPath = generateFolderPath(settings)

    checkParameters(settings)

    settings.repositoryPath = generateRepositoryPath(settings)
    settings.tokenType = generateTokenType(settings)

    await init(settings)
    status = await deploy(settings)
  } catch (error) {
    status = Status.FAILED
    setFailed(error.message)
  } finally {
    info(
      `${
        status === Status.FAILED
          ? 'Deployment failed! ❌'
          : status === Status.SUCCESS
          ? 'Completed deployment successfully! ✅'
          : 'There is nothing to commit. Exiting early… 📭'
      }`
    )

    exportVariable('DEPLOYMENT_STATUS', status)
  }
}
