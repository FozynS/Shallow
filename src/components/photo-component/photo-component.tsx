import { ChangeEvent, useRef, useState } from 'react';
import './photo-component.css';
import Cropper, { Area } from 'react-easy-crop';
import html2canvas from 'html2canvas';

function Photo ():JSX.Element {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const cropperRef = useRef<any>(null);

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
        setIsLoading(true);
        image.onload = () => {
          setIsLoading(false);
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
            const image = new Image();
            image.src = reader.result;
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };
  
  const onCropChange = (crop: { x: number; y: number }): void => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number): void => {
    setZoom(zoom);
  };

  const onCropComplete = (croppedAreaPercentage: Area, croppedAreaPixels: Area): void => {
    setCroppedArea(croppedAreaPixels);
  };

  const handleDownload = async () => {
    const cropper = cropperRef.current;
    if (!cropper || !croppedArea || !imageUrl) return;

    try {
      const croppedImageBlob = await getCroppedImageBlob(imageUrl, croppedArea);

      const link = document.createElement('a');
      link.download = 'cropped-image.png';
      link.href = URL.createObjectURL(croppedImageBlob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download cropped image:', error);
    }
  };


  const getCroppedImageBlob = (imageSrc: string, croppedArea: Area): Promise<Blob> => {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to create canvas context.');

        canvas.width = croppedArea.width;
        canvas.height = croppedArea.height;

        ctx.drawImage(
          image,
          croppedArea.x,
          croppedArea.y,
          croppedArea.width,
          croppedArea.height,
          0,
          0,
          croppedArea.width,
          croppedArea.height
        );

        canvas.toBlob((blob) => {
          if (!blob) throw new Error('Failed to create blob.');
          resolve(blob);
        }, 'image/png', 1);
      };
      image.onerror = () => {
        throw new Error('Failed to load image.');
      };
      image.src = imageSrc;
    });
  };



  const progress = (zoom - 1) / (3 - 1) * 100;

  return (
    <section className='section'>
      {!imageUrl ? (
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
      ) : (
        <div className='photo-change-wrapper'>
          <div className='image-container'>
            <Cropper
              ref={cropperRef}
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropComplete}
              cropShape="rect"
              cropSize={{ width: 200, height: 200 }}
            />
          </div>
          <div className='change-photo'>
            <span>X</span>
            <div className='input-wrapper'>
              <span>-</span>
              <input
                type="range"
                id="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                style={{background: `linear-gradient(to right, #259AC2 ${progress}%, #ccc ${progress}%)`}}
              />
              <span>+</span>
            </div>
            <span onClick={handleDownload}>&#10003;</span>
          </div>
        </div>
      )}
      {isLoading && <div>Loading...</div>}
      {error ? <div className="error">{error}</div> : null}
    </section>
  );
}

export default Photo;
