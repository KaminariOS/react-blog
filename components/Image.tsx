import NextImage, { ImageProps } from 'next/image'

const basePath = process.env.BASE_PATH

const Image = ({ src, ...rest }: ImageProps) => {
  if (typeof src === 'string') {
    const normalizedSrc = src.startsWith('https://') ? src : `${basePath || ''}${src}`
    return <NextImage src={normalizedSrc} {...rest} />
  }

  return <NextImage src={src} {...rest} />
}

export default Image
