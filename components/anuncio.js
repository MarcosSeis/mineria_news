import style from '@/styles/anuncio.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function Anuncio({ruta, fondo=false, link }) {

    const fb = fondo;

  return (
    <div>
        <Link href={link}>
        <Image src={ruta}
                        width={120}
                        height={60}
                        alt={`Imagen `}
                        className={fb ? style.bgn : ''}
                         />
        </Link>
    </div>
  )
}
