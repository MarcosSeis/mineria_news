import style from '@/styles/anuncio.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function Anuncio({ruta, fondo=false, link, alt='Anuncio'}) {

  return (
    <div>
        <Link href={link} target="_blank" rel="noopener noreferrer">
        <Image src={ruta}
                        width={120}
                        height={60}
                        alt={alt}
                        className={fondo ? style.bgn : ''}
                         />
        </Link>
    </div>
  )
}
