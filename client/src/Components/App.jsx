const { useState } = require("react")
const { default: FileUpload } = require("./FileUpload")
const { default: Form } = require("./Form")

const _FILE_INPUT = 'fileInput'
const _FORM = 'form'

const App = () => {

  const [page, setPage] = useState(_FILE_INPUT)
  const [file, setFile] = useState(null)

  return (
    page === _FILE_INPUT ? <FileUpload setPage={setPage} _FORM={_FORM} setFile={setFile}/> : <Form file={file}/>
  )
}

export default App