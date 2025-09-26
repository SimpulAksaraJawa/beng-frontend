// import React, { createContext, useContext, useState, useEffect } from "react";

// type LoadingContextType = {
//   registerImage: () => void;
//   imageLoaded: () => void;
//   progress: number;
//   loading: boolean;
// };

// const LoadingContext = createContext<LoadingContextType | null>(null);

// export const useLoading = () => useContext(LoadingContext)!;

// export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [total, setTotal] = useState(0);
//   const [loaded, setLoaded] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const registerImage = () => setTotal(prev => prev + 1);
//   const imageLoaded = () => setLoaded(prev => prev + 1);

//   const progress = total === 0 ? 0 : Math.min(Math.round((loaded / total) * 100), 100);

//   useEffect(() => {
//     if (total > 0 && loaded >= total) {
//       const timeout = setTimeout(() => setLoading(false), 300); // Add a delay for smooth transition
//       return () => clearTimeout(timeout);
//     }
//   }, [loaded, total]);

//   return (
//     <LoadingContext.Provider value={{ registerImage, imageLoaded, progress, loading }}>
//       {children}
//     </LoadingContext.Provider>
//   );
// };