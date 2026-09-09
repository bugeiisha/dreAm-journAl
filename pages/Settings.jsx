import { useRef, useState } from 'react'
import { addDreams } from '../src/db/dreamDatabase'
import { parseLucidityDreams } from '../src/utils/lucidityImport'
import { exportDreams } from '../src/utils/dataExport'
import './Settings.css'

function Settings() {
    const [importMessage, setImportMessage] = useState('')
    const [isImporting, setIsImporting] = useState(false)
    const fileInputRef = useRef(null)
    const backupFileInputRef = useRef(null)

    function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleBackupImportClick() {
    backupFileInputRef.current?.click()
  }

  async function handleLucidityImport(event) {
    const file = event.target.files?.[0]

    if (!file) return

    setIsImporting(true)
    setImportMessage('')

    try {
      const text = await file.text()

      const importedDreams =
        parseLucidityDreams(text)

      if (importedDreams.length === 0) {
        setImportMessage(
          'Aucun rêve n’a été trouvé dans ce fichier.',
        )

        return
      }

      const confirmed = window.confirm(
        `${importedDreams.length} rêve${
          importedDreams.length > 1 ? 's' : ''
        } trouvé${
          importedDreams.length > 1 ? 's' : ''
        }.\n\nVoulez-vous les importer ?`,
      )

      if (!confirmed) {
        return
      }

      await addDreams(importedDreams)

      setImportMessage(
        `✓ ${importedDreams.length} rêve${
          importedDreams.length > 1 ? 's' : ''
        } importé${
          importedDreams.length > 1 ? 's' : ''
        } avec succès.`,
      )
    } catch (error) {
      console.error(
        'Impossible d’importer le fichier :',
        error,
      )

      setImportMessage(
        'Une erreur est survenue pendant l’importation.',
      )
    } finally {
      setIsImporting(false)

      event.target.value = ''
    }
  }

  async function handleBackupImport(event) {
    const file = event.target.files?.[0]

    if (!file) return

    setIsImporting(true)
    setImportMessage('')

    try {
      const text = await file.text()
      const backup = JSON.parse(text)

      const dreams = backup.dreams

      if (!Array.isArray(dreams) || dreams.length === 0) {
        setImportMessage(
          'Ce fichier ne contient aucun rêve valide.',
        )

        return
      }

      const confirmed = window.confirm(
        `${dreams.length} rêve${
          dreams.length > 1 ? 's' : ''
        } trouvé${
          dreams.length > 1 ? 's' : ''
        } dans la sauvegarde.\n\nVoulez-vous les importer ?`,
      )

      if (!confirmed) {
        return
      }

      await addDreams(dreams)

      setImportMessage(
        `✓ ${dreams.length} rêve${
          dreams.length > 1 ? 's' : ''
        } restauré${
          dreams.length > 1 ? 's' : ''
        } avec succès.`,
      )
    } catch (error) {
      console.error(
        'Impossible de restaurer la sauvegarde :',
        error,
      )

      setImportMessage(
        'Le fichier n’est pas une sauvegarde JSON valide.',
      )
    } finally {
      setIsImporting(false)

      event.target.value = ''
    }
  }

return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <span className="page-eyebrow">
            PARAMÈTRES
          </span>

          <h2>Paramètres</h2>

          <p>
            Gère ton journal et sauvegarde tes données.
          </p>
        </div>
      </header>

      <section className="settings-section">
        <div className="settings-section-header">
          <div>
            <span className="section-eyebrow">
              SAUVEGARDE
            </span>

            <h3>Mes données</h3>

            <p>
              Télécharge une copie complète de ton
              journal sur ton ordinateur.
            </p>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-icon">
            ↓
          </div>

          <div className="settings-card-content">
            <h4>Exporter mes rêves</h4>

            <p>
              Télécharge tous tes rêves dans un fichier
              JSON. Tu pourras l'utiliser pour restaurer
              ton journal plus tard.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={exportDreams}
          >
            Exporter
          </button>
        </div>

        <div className="settings-card">
          <div className="settings-card-icon">
            ↻
          </div>

          <div className="settings-card-content">
            <h4>Restaurer une sauvegarde</h4>

            <p>
              Réimporte tes rêves depuis un fichier de
              sauvegarde JSON exporté précédemment.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={handleBackupImportClick}
            disabled={isImporting}
          >
            {isImporting
              ? 'Importation...'
              : 'Restaurer'}
          </button>

          <input
            ref={backupFileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden-file-input"
            onChange={handleBackupImport}
          />
        </div>

        <div className="settings-card">
        <div className="settings-card-icon">
          ↑
        </div>
    
        <div className="settings-card-content">
          <h4>Importer depuis Lucidity</h4>
    
          <p>
            Importe tes anciens rêves depuis un fichier
            texte exporté par Lucidity.
          </p>
        </div>
    
        <button
          type="button"
          className="secondary-button"
          onClick={handleImportClick}
          disabled={isImporting}
        >
          {isImporting
            ? 'Importation...'
            : 'Importer'}
        </button>
          
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          className="hidden-file-input"
          onChange={handleLucidityImport}
        />
        </div>
            
        {importMessage && (
          <p className="import-message">
            {importMessage}
          </p>
        )}
        </section>
    </div>

    )
}

export default Settings