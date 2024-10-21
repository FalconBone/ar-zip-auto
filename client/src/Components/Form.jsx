import React, { useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import classes from './Form.module.css'
import CodeView from './CodeView';
import { _FILE_INPUT } from '../variables';

export default function Form(props) {

  const [taskNumber, setTaskNumber] = useState('')
  const [oldName, setOldName] = useState('');
  const [newName, setNewName] = useState('');
  const [offerValueName, setOfferValueName] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('oldName', oldName);
    formData.append('newName', newName);
    formData.append('offerValueName', offerValueName);

    console.log(formData);


    try {
      const response = await axios.post('http://localhost:5000/form', formData, {
        responseType: 'blob', // Чтобы получить файл обратно
      });

      // Создаем ссылку на скачивание файла
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'archive.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();

      props.setPage(_FILE_INPUT)
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
    }
  };

  const offerForm = (
    <form onSubmit={handleSubmit}>
          Имя
          <div className={classes.names}>
            <TextField
              label={'Заменить с'}
              variant='standard'
              className={classes.name}
              value={oldName}
              onChange={(e) => setOldName(e.target.value)} />
            <TextField
              label={'Заменить на'}
              variant='standard'
              className={classes.name}
              value={newName}
              disabled={oldName.length === 0 ? true : false}
              onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div className={classes.offerName}>            
            <TextField
            label={'Название заменяемой услуги'}
            variant='standard'
            className={classes.name}
            value={offerValueName}
            onChange={(e) => setOfferValueName(e.target.value)} />
          </div>
          <div className={classes.offerName}>
          <TextField
            label={'Номер таски'}
            variant='standard'
            className={classes.name}
            value={taskNumber}
            onChange={(e) => setTaskNumber(e.target.value)} />
          </div>
          
          <Button type='submit' variant="contained">Модифицировать</Button>
        </form>
  )

  const prelandingForm = (
    <form onSubmit={handleSubmit}>
          Имя
          <div className={classes.names}>
            <TextField
              label={'Заменить с'}
              variant='standard'
              className={classes.name}
              value={oldName}
              onChange={(e) => setOldName(e.target.value)} />
            <TextField
              label={'Заменить на'}
              variant='standard'
              className={classes.name}
              value={newName}
              disabled={oldName.length === 0 ? true : false}
              onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div className={classes.offerName}>            
            <TextField
            label={'Название заменяемой услуги'}
            variant='standard'
            className={classes.name}
            value={offerValueName}
            onChange={(e) => setOfferValueName(e.target.value)} />
          </div>
          <div className={classes.offerName}>
          <TextField
            label={'Номер таски'}
            variant='standard'
            className={classes.name}
            value={taskNumber}
            onChange={(e) => setTaskNumber(e.target.value)} />
          </div>
          
          <Button type='submit' variant="contained">Модифицировать</Button>
        </form>
  )

  return (
    <div className={classes.container}>
      <div className={classes.form}>
        <h1>HTML Processor</h1>
        
      </div>
    </div>
  );
}
