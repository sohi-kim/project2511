import React, { useState } from "react";
import { adminService } from '../services/api'
import '../index.css'
import "../styles/admin-upload.css";

const AdminUpload = () => {
  const [form, setForm] = useState({
    applianceType: "",
    manufacturer: "",
    productName: "",
    totalPages: ""
  });
  const [file, setFile] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("applianceType", form.applianceType);
    formData.append("manufacturer", form.manufacturer);
    formData.append("productName", form.productName);
    formData.append("totalPages", form.totalPages);
    formData.append("file", file);

   adminService.addCookBook(formData)
        .then(res => console.log("업로드 성공:", res.data))
        .catch(err => console.error("에러 발생:", err))

    alert("업로드 완료!");
  };

 return (
    <div className="admin-container">
      <h2 className="admin-title">주방가전 요리책 업로드</h2>

      <div className="form-group">
        <label>가전종류</label>
        <input name="applianceType" type="text" />
      </div>

      <div className="form-group">
        <label>제조사</label>
        <input name="manufacturer" type="text" />
      </div>

      <div className="form-group">
        <label>제품명</label>
        <input name="productName" type="text" />
      </div>

      <div className="form-group">
        <label>총 페이지 수</label>
        <input name="totalPages" type="number" />
      </div>

      <label className="file-input-wrapper">
        📄 PDF 파일 업로드
        <input type="file" />
      </label>

      <button className="upload-btn">업로드</button>
    </div>
  );
};

export default AdminUpload;
