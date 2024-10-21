import { _FILE_INPUT } from "../variables"

const { useState } = require("react")
const { default: FileUpload } = require("./FileUpload")
const { default: Form } = require("./Form")


const App = () => {

  const [page, setPage] = useState(_FILE_INPUT)
  const [file, setFile] = useState(null)

  return (
    page === _FILE_INPUT
      ?
    <FileUpload setPage={setPage} setFile={setFile}/>
      :
    <Form file={file} setFile={setFile}/>
  )
}

export default App