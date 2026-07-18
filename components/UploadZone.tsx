// 'use client'

// import { useRef } from 'react'

// interface Props {
//   label: string
//   accept: string
//   multiple: boolean
//   onFiles: (files: File[]) => void
//   selectedFiles: File[]
// }

// export default function UploadZone({ label, accept, multiple, onFiles, selectedFiles }: Props) {
//   const inputRef = useRef<HTMLInputElement>(null)

//   function handleDrop(e: React.DragEvent) {
//     e.preventDefault()
//     const files = Array.from(e.dataTransfer.files)
//     onFiles(multiple ? files : [files[0]])
//   }

//   function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const files = Array.from(e.target.files || [])
//     onFiles(multiple ? files : [files[0]])
//   }

//   return (
//     <div>
//       <div
//         onDrop={handleDrop}
//         onDragOver={(e) => e.preventDefault()}
//         onClick={() => inputRef.current?.click()}
//         className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-gray-500 hover:bg-gray-900 transition-all"
//       >
//         <div className="text-gray-500 text-sm">{label}</div>
//         <div className="text-gray-600 text-xs mt-1">or click to browse — {accept}</div>
//         <input
//           ref={inputRef}
//           type="file"
//           accept={accept}
//           multiple={multiple}
//           onChange={handleChange}
//           className="hidden"
//         />
//       </div>

//       {selectedFiles.length > 0 && (
//         <ul className="mt-3 space-y-1">
//           {selectedFiles.map((f, i) => (
//             <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
//               <span className="text-green-500">✓</span>
//               {f.name}
//               <span className="text-gray-600 text-xs">({(f.size / 1024).toFixed(0)} KB)</span>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   )
// }
'use client'

import { useRef } from 'react'

interface Props {
  label: string
  accept: string
  multiple: boolean
  onFiles: (files: File[]) => void
  selectedFiles: File[]
}

export default function UploadZone({ label, accept, multiple, onFiles, selectedFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    onFiles(multiple ? files : [files[0]])
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    onFiles(multiple ? files : [files[0]])
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-gray-500 hover:bg-gray-900 transition-all"
      >
        <div className="text-gray-500 text-sm">{label}</div>
        <div className="text-gray-600 text-xs mt-1">or click to browse — {accept}</div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <ul className="mt-3 space-y-1">
          {selectedFiles.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-green-500">✓</span>
              {f.name}
              <span className="text-gray-600 text-xs">({(f.size / 1024).toFixed(0)} KB)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}