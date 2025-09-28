import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from '@/router';
import { LoaderIcon } from "lucide-react";
import React from 'react'

const index = () => {
  const { user, accessToken, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <LoaderIcon className="animate-spin size-10" />
      </div>
    )
  }

  if (!user || !accessToken) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to="/dashboard" replace />

}

export default index
