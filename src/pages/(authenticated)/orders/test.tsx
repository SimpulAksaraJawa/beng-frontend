import React, { useEffect } from 'react'
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

// cuman test biarin aja

interface OrderDetailRow {
    id: number;
    invoice: string;
    supplierName: string;
    productName: string;
    qty: number;
    price: number;
}

const test = () => {
    const fetchOrderDetails = async (): Promise<OrderDetailRow[]> => {
        const res = await api.get("/order-details");
        console.log(res.data?.data);
        return res.data?.data ?? [];
    }
    useEffect(() => {
        fetchOrderDetails();
    }, []);

  return (
    <div>
        {JSON.stringify(fetchOrderDetails())}
    </div>
  )
}

export default test
