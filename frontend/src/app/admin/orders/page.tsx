"use client";
import { OrderDetailsDialog } from "@/app/account/orders/OrderDetailsDialog";
import AdminLayout from "@/app/components/admin/AdminLayout";
import OrderEditForm from "@/app/components/admin/OrderEditForm";
import OrderPaymentDialog from "@/app/components/admin/OrderPaymentDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/constant/pagination";
import BookLoader from "@/lib/BookLoader";
import { useGetAdminOrdersQuery } from "@/store/adminApi";
import { Calendar, CreditCard, Edit, Filter, Search, ShoppingBag } from "lucide-react";
import React, { useMemo, useState } from "react";

const page = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);

  const { data: OrdersData, isLoading: isOrderLoading } =
    useGetAdminOrdersQuery(filters);
  const allOrders = OrdersData?.data?.orders || [];

  const filteredOrders = useMemo(() => {
    if (!filters.search) return allOrders;
    const searchTerm = filters.search.toLowerCase();
    return allOrders.filter((order: any) => {
      return (
        order._id.toLowerCase().includes(searchTerm) ||
        (order.user?.name && order.user.name.toLowerCase().includes(searchTerm))
      );
    });
  }, [allOrders, filters.search]);

  //calculate pagination
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  //get current page items
  const currentOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      paymentStatus: "",
      startDate: "",
      endDate: "",
      search: "",
    });
    setCurrentPage(1);
  };


  const handleCloseEditDailog = () =>{
    setEditingOrder(null)
  }


  const handleClosePaymentDailog = () =>{
    setPaymentOrder(null)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Orders Management
          </h1>
        </div>

        {/* filters */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter orders by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses"></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <Select
                  value={filters.paymentStatus}
                  onValueChange={(value) =>
                    handleFilterChange("paymentStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses"></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search order Id or customer"
                    className="pl-8"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    className="pl-8"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    className="pl-8"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex items-end space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders table */}

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Orders
            </CardTitle>
            <CardDescription>
              Showing {currentOrders.length} of {totalItems} orders
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isOrderLoading ? (
              <div className="flex justify-center py-10">
                <BookLoader />
              </div>
            ) : currentOrders.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No orders found
                </h3>
                <p className="mt-1 text-xm text-gray-500">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Id</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.map((order: any) => (
                      <TableRow key={order?._id}>
                        <TableCell className="font-medium">
                          #{order._id.slice(-6)}
                        </TableCell>
                        <TableCell>{order.user && order.user.name}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell >₹{order.totalAmount}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold *:
                              ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "shipped"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }
                              
                              `}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold *:
                              ${
                                order.paymentStatus === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.paymentStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }
                              
                              `}
                          >
                            {order.paymentStatus.charAt(0).toUpperCase() +
                              order.paymentStatus.slice(1)}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                             <div className="flex justify-end space-x-2">
                                  <OrderDetailsDialog order={order}/>

                                  <Button  variant='outline' size='sm' onClick={() => setEditingOrder(order)}>
                                    <Edit className="h-4 w-4 mr-1"/>
                                   Edit
                                  </Button>


                                  <Button  variant='outline' size='sm' onClick={() => setPaymentOrder(order)}>
                                    <CreditCard className="h-4 w-4 mr-1"/>
                                  Pay Seller
                                  </Button>
                             </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}


            {/* custome pagination */}
            {!isOrderLoading && currentOrders.length> 0 && (
                <div className="mt-5">
                  <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                  />
                </div>
            )}
          </CardContent>
        </Card>
      </div>


      {/* editing order dialog */}

      {editingOrder && (
        <Dialog open={!!editingOrder} onOpenChange={(open) => !open && handleCloseEditDailog()}>
         <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-purple-700">
                        Edit Order
                    </DialogTitle>
                     <OrderEditForm order={editingOrder} onClose={handleCloseEditDailog}/>
                </DialogHeader>
         </DialogContent>
        </Dialog>
      )}


{paymentOrder && (
        <Dialog open={!!paymentOrder} onOpenChange={(open) => !open && handleClosePaymentDailog()}>
         <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-purple-700">
                        Process Seller Payment
                    </DialogTitle>
                     <OrderPaymentDialog order={paymentOrder} onClose={handleClosePaymentDailog}/>
                </DialogHeader>
         </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
};

export default page;
