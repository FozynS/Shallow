import React, { useState } from 'react';
import './smoking.css';

const Smoking: React.FC = () => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [smokingStatus, setSmokingStatus] = useState<string | null>(null);
  const [textOfSmoking, setTextOfSmoking] = useState<string>('');

  const handleSelect = (status: string) => {
    setTextOfSmoking('');
    setSmokingStatus(status);
  };

  const handleLimitationSelect = (option: string) => {
    setTextOfSmoking(prevText => prevText.replace(/Не в квартирі|Тільки на балконі|Ні/g, '').trim());
    addTextOfSmoking(option);
  };
  
  const handleOptionClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.dataset.option) {
      const optionText = target.dataset.option;
      if (target.getAttribute('name') === 'limitation-of-smoking') {
        handleLimitationSelect(optionText);
      } else {
        addTextOfSmoking(optionText);
      }
    }
  };
  
  const addTextOfSmoking = (text:string) => {
    setTextOfSmoking(prevText => {
      if (prevText.includes(text)) {
        return prevText.replace(`${text},`, '').replace(text, '');
      } else {
        return `${prevText.trim()} ${text}`;
      }
    });
  };

  const clearTextOfSmoking = () => {
    setTextOfSmoking('');
    setSmokingStatus(null);
  };

  const isSmokingSelected = smokingStatus !== null;

  return (
    <div className="custom-select">
      <h2>Паління</h2>
        <div className='select-trigger' style={textOfSmoking ? undefined : {borderColor: '#bf1d1d', color: '#bf1d1d'}} onClick={() => setShowOptions(!showOptions)}>
        <span>{isSmokingSelected ? textOfSmoking : 'Виберіть хочаб один вид паління'}</span>
          <span onClick={clearTextOfSmoking}>X</span>
        </div>
      {showOptions && (
        <div className="options" onClick={handleOptionClick}>
          <label>
            <input 
              className='radio' 
              type="radio" 
              name='smoking' 
              data-option='Палю'
              onClick={() => handleSelect('Палю')} />
            Палю
          </label>
          {smokingStatus === 'Палю' && (
            <>
              <div className='variant-of-smoking'>
                <label>
                  <input className='checkbox' type="checkbox" data-option='Цигарки,'/>
                  Цигарки
                </label>
                <label>
                  <input className='checkbox' type="checkbox" data-option='Вейп,'/>
                  Вейп
                </label>
                <label>
                  <input className='checkbox' type="checkbox" data-option='Тютюн,'/>
                  Тютюн
                </label>
                <label>
                  <input className='checkbox' type="checkbox" data-option='IQOS,'/>
                  IQOS
                </label>
              </div>
              <div className='limitation'>
                Готовий обмежитись?
                <label>
                  <input type="radio" name='limitation-of-smoking' data-option='Ні'/>
                  Ні
                </label>
                <label>
                  <input type="radio" name='limitation-of-smoking' data-option='Тільки на балконі'/>
                  Тільки на балконі
                </label>
                <label>
                  <input type="radio" name='limitation-of-smoking' data-option='Не в квартирі'/>
                  Не в квартирі
                </label>
              </div>
            </>
          )}
          <label>
            <input 
              className='radio' 
              type="radio" 
              name='smoking' 
              data-option='Не палю'
              onClick={() => handleSelect('Не палю')}
            />
            Не палю
          </label>
        </div>
      )}
    </div>
  );
};

export default Smoking;
