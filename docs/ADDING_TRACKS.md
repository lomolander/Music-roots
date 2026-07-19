# Aggiungere nuovi blocchi di brani

Music Roots conserva i brani in `src/data/tracks/`, divisi per famiglie musicali. `index.js` è l'aggregatore consumato dall'app tramite il compatibile `src/data/questions.js`.

## Procedura per un blocco di 50–100 brani

1. Scegli il modulo coerente con `genre`. Se serve una nuova famiglia, crea il file, importalo in `tracks/index.js` e registrane il genere e la playlist in `libraryConfig.js`.
2. Usa ID interi nuovi. Per il prossimo blocco parti da `301`; non riutilizzare e non rinumerare gli ID esistenti.
3. Compila almeno `id`, `artist`, `title`, `album`, `year` e `genre`. Sono supportati anche `subgenre`/`sottogenere`, `cover`, `curiosity`, `influences`, `meaning`, `scenario`, `similarArtists`, `essentialPlaylist`, `links` (`spotify`, `appleMusic`, `youtube`) e `deezer`.
4. Non inserire manualmente una preview incerta. I campi editoriali opzionali hanno fallback innocui, ma è preferibile completarli prima della pubblicazione.
5. Esegui `npm run validate:library`. Correggi ID, duplicati, genere, playlist e link prima di interrogare Apple.
6. Esegui `npm run validate:apple` per i soli nuovi brani. Sono disponibili anche `-- --new`, `-- --status=needs-review`, `-- --status=wrong-version`, `-- --status=no-match`, `-- --genre="French House"`, `-- --file=house-techno`, `-- --all` e `-- --force`.
7. Leggi `scripts/apple-preview-report.json`: `verified` entra nel quiz; `needs-review` richiede controllo umano; `wrong-version` indica una versione vietata; `no-match` nessun risultato affidabile; `missing-preview` un match corretto privo di audio.
8. Correggi prima i dati richiesti (artista, titolo, album, anno). Non promuovere manualmente remix, live, cover o altre versioni non richieste. Usa `--force` solo per ignorare una corrispondenza `verified` già in cache.
9. Concludi con `npm run validate:library`, `npm run build`, lint sui file modificati e `npm run test:quiz`.

La cache persistente è `src/data/apple-preview-metadata.js`; non cancellarla durante un'importazione. Il validatore conserva i match `verified` e aggiorna automaticamente metadati, URL e report. Il fallback Deezer rimane separato negli script esistenti.
