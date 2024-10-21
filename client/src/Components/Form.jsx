import React, { useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import classes from './Form.module.css'
import CodeView from './CodeView';

export default function Form(props) {

  const [includeBlock, setIncludeBlock] = useState('');
  const [oldName, setOldName] = useState('');
  const [newName, setNewName] = useState('');
  const [newHref, setNewHref] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('oldName', oldName);
    formData.append('newName', newName);

    try {
      const response = await axios.post('http://localhost:5000/form', formData, {
        responseType: 'blob', // Чтобы получить файл обратно
      });

      // Создаем ссылку на скачивание файла
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'processed-file.html');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.form}>
        <h1>HTML Processor</h1>
        <form onSubmit={handleSubmit}>
        Имя
          <div className={classes.names}>
            <TextField
              label={'Заменить с'}
              variant='standard'
              className={classes.name}
              value={oldName}
              onChange={(e) => setOldName(e.target.value)}/>
            <TextField
              label={'Заменить на'}
              variant='standard'
              className={classes.name}
              value={newName}
              disabled={oldName.length === 0 ? true : false}
              onChange={(e) => setNewName(e.target.value)}/>
          </div>

          <Button type='submit' variant="contained">Модифицировать</Button>
        </form>
      </div>
      <div className={classes.codeview}>
        {/* {<CodeView html={props.file}/>} */}
      </div>
    </div>
  );
}
