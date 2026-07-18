// 'use client'

// import { useState } from 'react'
// import { VendorResult } from '@/lib/scorer'
// import VendorCard from './VendorCard'

// interface Props {
//   results: VendorResult[]
//   tenderId: string
// }

// export default function RankedTable({ results }: Props) {
//   const [expanded, setExpanded] = useState<string | null>(null)

//   return (
//     <div className="space-y-4">
//       {results.map((vendor) => (
//         <VendorCard
//           key={vendor.vendorId}
//           vendor={vendor}
//           isExpanded={expanded === vendor.vendorId}
//           onToggle={() => setExpanded(
//             expanded === vendor.vendorId ? null : vendor.vendorId
//           )}
//         />
//       ))}
//     </div>
//   )
// }
'use client'

import { useState } from 'react'
import { VendorResult } from '@/lib/scorer'
import VendorCard, { Props as VendorCardProps } from './VendorCard'

interface Props {
  results: VendorResult[]
  tenderId: string
}

// Ensure VendorCardProps is used to avoid unused import warning
type _Check = VendorCardProps

export default function RankedTable({ results }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {results.map((vendor) => (
        <VendorCard
          key={vendor.vendorId}
          vendor={vendor}
          isExpanded={expanded === vendor.vendorId}
          onToggle={() => setExpanded(
            expanded === vendor.vendorId ? null : vendor.vendorId
          )}
        />
      ))}
    </div>
  )
}