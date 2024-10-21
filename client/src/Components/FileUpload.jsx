import axios from "axios"

const { Button } = require("@mui/material")

const FileUpload = (props) => {
    
    const handleFileUpload = async (event) => {

        const formData = new FormData()
        formData.append('html', event.target.files[0])

        const response = await axios.post('http://localhost:5000/upload', formData, {
            responseType: 'blob', // Чтобы получить файл обратно
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        const reader = new FileReader();
        reader.readAsText(response.data);
        
        reader.onload = () => {
            // Когда чтение завершено, сохраняем содержимое в state
            props.setFile(reader.result); // reader.result содержит текст
        };

        props.setPage(props._FORM)
    }

    return (
        <div>
            <Button variant="contained" component="label" size="large">
                Загрузите HTML файл
                <input
                    hidden 
                    accept=".html" 
                    type="file" 
                    onChange={handleFileUpload}/>
            </Button>
        </div>
    )
}

export default FileUpload