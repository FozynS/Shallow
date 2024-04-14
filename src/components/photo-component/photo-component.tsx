import { ChangeEvent, useState } from 'react';
import './photo-component.css'

function Photo ():JSX.Element {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(50);

  const validateImage = (file: File): Promise<boolean> => {
    const allowedExtensions = ['jpeg', 'jpg', 'png', 'heic', 'heif'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return new Promise((resolve) => {
      if (file.size > 20 * 1024 * 1024) {
        setError('Размер файла превышает 20МБ.');
        resolve(false);
      } else if(!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setError('Недопустимое расширение файла');
        resolve(false);
      } else {
        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          URL.revokeObjectURL(image.src);
          if (image.width < 200 || image.height < 200 || image.width > 8192 || image.height > 8192) {
            setError('Размеры изображения должны быть от 200x200 до 8192x8192px.');
            resolve(false);
          } else {
            setError(null);
            resolve(true);
          }
        };
      }
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (file) {
      const isValid = await validateImage(file);
      if (isValid) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setImageUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(event.target.value);
    setSliderValue(value);
  };

  const progress = (sliderValue / 100) * 100; 

  return (
    <section className='section'>
      <div className='upload-wrapper'>
        <img src="./img/AddPhoto.svg" alt="#" />
        <div className='clue'>
          <input type="file" name='file' id='file' className='input-file' onChange={handleFileChange}/>
          <label htmlFor="file">
            <img src="./img/Upload.svg" alt="#" />
            <p>Обличчя. До 20МБ <span>200*200 - 8192*8192px</span> jpeg, jpg, png, heic, heif</p>
          </label>
        </div>
      </div>
      {error ? <div className="error">{error}</div> : null}
      {imageUrl ? (
        <div className='photo-change-wrapper'>
          <div className='image-container'>
            <img
              src={imageUrl ? imageUrl : ''}
              alt="#"
              style={{
                transform: `scale(${sliderValue / 100})`,
                transformOrigin: 'top left'
              }}
            />
          </div>
          <div className='change-photo'>
            <span>X</span>
            <div className='input-wrapper'>
              <span>-</span>
              <input
                type="range"
                id="range2"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleSliderChange}
                style={{background: `linear-gradient(to right, #259AC2 ${progress}%, #ccc ${progress}%)`}}
              />
              <span>+</span>
            </div>
            <span>&#10003;</span>
          </div>
        </div>
      ) : null}
      
    </section>
  );
}

export default Photo;
