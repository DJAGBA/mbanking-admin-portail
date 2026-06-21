// app/(admin)/url-limits/page.tsx
import { redirect } from 'next/navigation';

export default function UrlLimitsPage() {
  redirect('/rate-limits');
}

// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { getUrlLimits,createUrlLimit,deleteUrlLimit,assignUrlLimitUser,updateUrlLimitUser,} from '@/services/url-limits.service';
// import { UrlLimit, CreateUrlRequest } from '@/src/types/url-limit';
// import { UrlTable } from './components/urlTable';
// import { AssignUrlUserStepper } from './components/urlUserForm';
// import { DeclareUrlUserWizard } from './components/declareurluser';
// import { Pagination } from '@/components/ui/pagination';
// import { ConfirmDialog } from '@/components/ui/confirmDialog';
// import { Plus, RotateCw, AlertCircle, X } from 'lucide-react';
// import { toast } from 'sonner';
// export default function UrlLimitsPage() {
//   const [urls, setUrls] = useState<UrlLimit[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(5);
//   const [total, setTotal] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);
//   const [showWizard, setShowWizard] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [dialogConfig, setDialogConfig] = useState<{title: string; message: string; description?: string; isDangerous?: boolean;
//     onConfirm: () => void;
//   } | null>(null);
//   // User limit assignment and updates
//   const [showAssignForm, setShowAssignForm] = useState(false);
//   const [assignUrlId, setAssignUrlId] = useState<string | null>(null);
//   const [editingUser, setEditingUser] = useState<any>(null);
//   // Handler to open the assignment form
//   const handleAssignUser = (urlId: string) => {
//     setAssignUrlId(urlId);
//     setEditingUser(null); // Create mode (POST)
//     setShowAssignForm(true);
//   };
//   // Handler to submit the assignment or update form (adjust to your logic)
// const handleSubmitAssignUser = async (userId: string, data: any) => {
//     try {
//       setLoading(true);
//       if (editingUser) {
//         // PUT: update quotas for an existing user
//         await updateUrlLimitUser(assignUrlId!, editingUser.userId, data);
//         toast.success('Limites modifiées avec succès !');
//       } else {
//         // POST: new assignment
//         await assignUrlLimitUser(assignUrlId!, userId, data);
//         toast.success('Utilisateur assigné avec succès !');
//       }
//       await fetchUrls(); // Refresh the table to see updates
//       setShowAssignForm(false);
//       setAssignUrlId(null);
//       setEditingUser(null);
//     } catch (err: unknown) {
//       const error = err as Error;
//       toast.error(error.message || "Erreur lors de l'opération");
//     } finally {
//       setLoading(false);
//     }
//   };
//   const fetchUrls = useCallback(async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const response = await getUrlLimits(page, limit);
//       if (response?.data?.items) {
//         setUrls(response.data.items);
//         setTotal(response.data.pagination?.total || 0);
//         setTotalPages(response.data.pagination?.totalPages || 0);
//       }
//     } catch (err: unknown) {
//       const error = err as Error;
//       setError(error?.message || 'Erreur lors du chargement');
//     } finally {
//       setLoading(false);
//     }
//   }, [page, limit]);
//   useEffect(() => {
//     fetchUrls();
//   }, [fetchUrls]);
//   // Handler to open the delete confirmation dialog for a URL limit
//   const handleCreate = async (data: CreateUrlRequest) => {
//     try {
//       const newUrl = await createUrlLimit(data);
//       setShowWizard(false);
//       if (process.env.NEXT_PUBLIC_USE_MOCK === 'true' && newUrl) {
//         setUrls(prev => [newUrl, ...prev]);
//         setTotal(prev => prev + 1);
//       } else {
//         await fetchUrls();
//       }
//       toast.success('URL déclarée avec succès !');
//     } catch (err: unknown) {
//       const error = err as Error;
//       setError(error?.message || 'Erreur lors de la création');
//     }
//   };
//   // Handler to open the delete confirmation dialog for a URL limit
//   const handleDelete = (id: string) => {
//     setDialogConfig({
//       title: "Supprimer l'URL",
//       message: 'Êtes-vous sûr de vouloir supprimer cette URL ?',
//       description: 'Toutes les limites configurées sur cette URL seront supprimées.',
//       isDangerous: true,
//       onConfirm: async () => {
//         try {
//           await deleteUrlLimit(id);
//           if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
//             setUrls(prev => prev.filter(u => String(u.id) !== id));
//             setTotal(prev => prev - 1);
//           } else {
//             await fetchUrls();
//           }
//           setDialogOpen(false);
//           toast.success('URL supprimée avec succès !');
//         } catch (err: unknown) {
//           const error = err as Error;
//           setError(error?.message || 'Erreur lors de la suppression');
//           setDialogOpen(false);
//         }
//       }
//     });
//     setDialogOpen(true);
//   };
//   function renderContent() {
//     if (loading) {
//       return (
//         <div className="py-20 flex flex-col items-center justify-center">
//           <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-900 animate-spin mb-4" />
//           <p className="text-gray-600 font-medium">Chargement...</p>
//         </div>
//       );
//     }
//     if (urls.length > 0) {
//       return (
//         <>
//           <UrlTable
//             urls={urls}
//             onDelete={handleDelete}
//           />
//           <div className="border-t border-gray-200">
//             <Pagination
//               page={page}
//               totalPages={totalPages}
//               total={total}
//               limit={limit}
//               onPageChange={setPage}
//               onLimitChange={(newLimit) => {
//                 setLimit(newLimit);
//                 setPage(1);
//               }}
//             />
//           </div>
//         </>
//       );
//     }
//     return (
//       <div className="py-20 flex flex-col items-center justify-center">
//         <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
//           <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
//           </svg>
//         </div>
//         <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune URL déclarée</h3>
//         <p className="text-gray-500 mb-6">Commencez par déclarer une URL</p>
//         <button
//           onClick={() => setShowWizard(true)}
//           className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-900 text-white font-medium rounded-lg transition-colors"
//         >
//           <Plus className="w-4 h-4" />
//           Déclarer une nouvelle URL
//         </button>
//       </div>
//     );
//   }

//   return (
//     <>
//       {dialogConfig && (
//         <ConfirmDialog
//           isOpen={dialogOpen}
//           title={dialogConfig.title}
//           message={dialogConfig.message}
//           description={dialogConfig.description}
//           isDangerous={dialogConfig.isDangerous}
//           confirmText="Confirmer"
//           cancelText="Annuler"
//           onConfirm={dialogConfig.onConfirm}
//           onCancel={() => setDialogOpen(false)}
//         />
//       )}


//       {showWizard && (
//         <DeclareUrlUserWizard
//           onSubmit={handleCreate}
//           onCancel={() => setShowWizard(false)}
//         />
//       )}

//       {showAssignForm && assignUrlId && (
//         <AssignUrlUserStepper
//           user={editingUser}
//           onSubmit={handleSubmitAssignUser}
//           onCancel={() => {
//             setShowAssignForm(false);
//             setAssignUrlId(null);
//             setEditingUser(null);
//           }}
//         />
//       )}

//       <div className="space-y-6">

//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Limites par URLs</h1>
//           <p className="text-gray-600">Configuration des quotas d'accès individuels pour ce point d'accès spécifiquet</p>
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-4">
//             <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
//             <div className="flex-1">
//               <p className="text-red-800 font-medium">{error}</p>
//             </div>
//             <button onClick={() => setError('')} className="text-red-600 hover:text-red-800 shrink-0">
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         )}

//         <div className="flex justify-end gap-3">
//           <button
//   onClick={() => fetchUrls()}
//   disabled={loading}
//   className="inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//   style={{ backgroundColor: '#FFDC00B2', color: '#00377D' }}
// >
//   <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//   Actualiser
// </button>
//           <button
//             onClick={() => setShowWizard(true)}
//             className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-900 text-white font-medium rounded-lg transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             Déclarer une nouvelle URL
//           </button>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           {renderContent()}
//         </div>

//       </div>
//     </>
//   );
// }