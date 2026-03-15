// import { motion } from 'framer-motion'
// import { ExternalLink, MessageCircle } from 'lucide-react'
// import { slideUp } from '../../animations/variants'
// import VoteButtons from './VoteButtons'
// import formatPrice from '../../utils/formatPrice'
// import timeAgo from '../../utils/timeAgo'

// const STATUS_STYLES = {
//   active:  { border: 'border-black',  shadow: 'shadow-brut-lg',  bg: '' },
//   bought:  { border: 'border-lime',   shadow: 'shadow-[6px_6px_0_#C6FF00]', bg: 'bg-[#F0FFF0]' },
//   skipped: { border: 'border-coral',  shadow: 'shadow-coral', bg: 'bg-[#FFF0F0]' },
// }

// const PLATFORM_BADGE = {
//   amazon:   { bg: 'bg-blue',   text: 'text-white',  label: 'Amazon' },
//   flipkart: { bg: 'bg-white',  text: 'text-black',  label: 'Flipkart' },
//   myntra:   { bg: 'bg-[#FF3E8A]', text: 'text-white', label: 'Myntra' },
//   other:    { bg: 'bg-cream',  text: 'text-black',  label: 'Other' },
// }

// export default function ProductCard({ product, onVoteUpdate, onSelect, isSelected }) {
//   const style = STATUS_STYLES[product.status] || STATUS_STYLES.active
//   const platform = product.platform ? PLATFORM_BADGE[product.platform] : null

//   return (
//     <motion.div
//       variants={slideUp}
//       whileHover={{ x: -3, y: -3 }}
//       onClick={() => onSelect(product)}
//       className={`bg-white border-[2.5px] ${style.border} ${style.shadow} ${style.bg}
//         cursor-pointer transition-shadow
//         ${isSelected ? 'ring-2 ring-offset-2 ring-black' : ''}
//       `}
//     >
//       {/* Image area */}
//       {product.image ? (
//         <img
//           src={product.image}
//           alt={product.title}
//           className="w-full aspect-video object-cover border-b-[2.5px] border-black"
//         />
//       ) : (
//         <div className="w-full aspect-video bg-cream border-b-[2.5px] border-black flex items-center justify-center">
//           <span className="text-4xl">
//             {product.platform === 'amazon' ? '📦'
//               : product.platform === 'flipkart' ? '🛍️'
//               : product.platform === 'myntra' ? '👗'
//               : '🛒'}
//           </span>
//         </div>
//       )}

//       <div className="p-4">
//         {/* Badge row */}
//         <div className="flex items-center gap-2 mb-2 flex-wrap">
//           {platform && (
//             <span className={`font-mono text-[10px] font-bold uppercase tracking-widest ${platform.bg} ${platform.text} border-[2px] border-black px-2 py-0.5`}>
//               {platform.label}
//             </span>
//           )}
//           {product.status !== 'active' && (
//             <span className={`font-mono text-[10px] font-bold uppercase tracking-widest border-[2px] border-black px-2 py-0.5
//               ${product.status === 'bought' ? 'bg-lime text-black' : 'bg-coral text-white'}`}>
//               {product.status}
//             </span>
//           )}
//           {/* New badge — added within last 30 min */}
//           {new Date() - new Date(product.createdAt) < 30 * 60 * 1000 && (
//             <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-black text-yellow border-[2px] border-black px-2 py-0.5">
//               New
//             </span>
//           )}
//         </div>

//         {/* Title */}
//         <h3 className="font-display text-base font-bold leading-tight mb-1 line-clamp-2">
//           {product.title}
//         </h3>

//         {/* Price */}
//         {product.price && (
//           <p className="font-mono text-lg font-bold mb-2">
//             {formatPrice(product.price, product.currency)}
//           </p>
//         )}

//         {/* Meta */}
//         <p className="font-mono text-[11px] text-muted mb-3">
//           Added by @{product.addedBy?.username} · {timeAgo(product.createdAt)}
//         </p>

//         {/* Bottom row */}
//         <div className="flex items-center justify-between">
//           <VoteButtons product={product} onVoteUpdate={onVoteUpdate} />

//           <div className="flex items-center gap-2">
//             <button
//               onClick={(e) => { e.stopPropagation(); onSelect(product) }}
//               className="flex items-center gap-1 font-mono text-xs text-muted hover:text-black"
//             >
//               <MessageCircle size={14} />
//               {product.commentCount || 0}
//             </button>

//             {product.link && (
              
//                 href={product.link}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 onClick={(e) => e.stopPropagation()}
//                 className="font-mono text-xs text-blue hover:underline flex items-center gap-1"
//               >
//                 <ExternalLink size={12} />
//                 View
//               </a>
//             )}
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   )
// }