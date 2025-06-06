import fs from 'fs'
const os = require('os');
import packageInfo from '../package.json'

export default function HomePage() {
  const { name, version } = packageInfo

  // Controllo se siamo in Docker (versione semplice)
  let runningInDocker = false

  try {
    const cgroup = fs.readFileSync('/proc/1/cgroup', 'utf8')
    runningInDocker = cgroup.includes('docker') || cgroup.includes('kubepods')
  } catch {
    runningInDocker = false
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-base-200 pt-20 px-6">
      <div className="max-w-2xl w-full space-y-8">

        {/* Title and version */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">{name}</h1>
          <p className="text-sm text-gray-500">
            Version: <span className="font-mono">{version}</span>
          </p>
        </div>

        {/* Repository */}
        <div className="bg-base-100 rounded-lg shadow p-6 text-left">
          <h2 className="text-xl font-semibold mb-2">Source repository</h2>
          <ul className="list-disc pl-5">
            <li><a href='https://github.com/FabLeo451/control-panel/tree/main' target="_blank" className="link">Control panel</a></li>
            <li><a href='https://github.com/FabLeo451/Websocket-server' target="_blank" className="link">Websocket server</a></li>
          </ul>
        </div>

        {/* Info */}
        <div className="bg-base-100 rounded-lg shadow p-6 text-left">
          <h2 className="text-xl font-semibold mb-2">Runtime</h2>
          <ul className="space-y-2 text-gray-800 text-sm">
            <li>
              <strong>Environment: </strong><span>{process.env.NODE_ENV}</span>
            </li>
            <li>
              <strong>Host: </strong><span>{os.hostname()}</span>
            </li>
            <li>
              <strong>Running in Docker:</strong>{' '}
              {runningInDocker ? (
                <span>Yes</span>
              ) : (
                <span>No</span>
              )}
            </li>
          </ul>
        </div>

      </div>
    </main>
  )
}
