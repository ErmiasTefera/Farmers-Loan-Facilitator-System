import React from 'react'

interface ImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  [key: string]: string | number | boolean | undefined
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  ...props
}) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      {...props}
    />
  )
}

export default Image
