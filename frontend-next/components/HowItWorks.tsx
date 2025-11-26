"use client";
import React from "react";

export default function HowItWorks() {
  return (
    <section className="py-12 bg-gray-50 sm:py-16 lg:py-20 font-pj">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">QUY TRÌNH HOẠT ĐỘNG</h2>
          <p className="mt-2 text-base text-gray-600">Quyên góp minh bạch chỉ với 4 bước đơn giản</p>
        </div>

        <div className="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center p-6 bg-white border border-gray-100 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12 mx-auto text-white bg-green rounded-full">1</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Kết nối ví & Chọn dự án</h3>
            <p className="mt-2 text-sm text-gray-600">
              Kết nối ví điện tử của bạn (MetaMask, Trust Wallet...)
              rồi lựa chọn dự án từ thiện mà trái tim bạn muốn hướng về.
            </p>
          </div>

          <div className="text-center p-6 bg-white border border-gray-100 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12 mx-auto text-white bg-indigo-500 rounded-full">2</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Quyên góp trực tiếp</h3>
            <p className="mt-2 text-sm text-gray-600">
              Số tiền của bạn sẽ được chuyển thẳng vào Hợp đồng thông minh (Smart Contract) của dự án.
            </p>
          </div>

          <div className="text-center p-6 bg-white border border-gray-100 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12 mx-auto text-white bg-blue-500 rounded-full">3</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Ghi nhận minh bạch</h3>
            <p className="mt-2 text-sm text-gray-600">
              Hệ thống Blockchain lưu trữ giao dịch vĩnh viễn và công khai,
              không ai có thể sửa đổi hay xóa bỏ và bạn có thể tự kiểm tra.
            </p>
          </div>

          <div className="text-center p-6 bg-white border border-gray-100 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12 mx-auto text-white bg-yellow-500 rounded-full">4</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Theo dõi giải ngân</h3>
            <p className="mt-2 text-sm text-gray-600">
              Nhận thông báo khi quỹ được giải ngân cho người thụ hưởng.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
