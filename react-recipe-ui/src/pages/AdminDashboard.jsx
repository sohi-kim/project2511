import React, { useState } from "react";
import "../styles/adminDashboard.css";
import { adminService } from "../services/api";
import { useEffect } from "react";

const categories = [
  "전기밥솥",
  "쥬서기",
  "믹서기",
  "오븐",
  "전자레인지",
  "에어프라이어"
];

// const initialData = {
//   전기밥솥: [],
//   쥬서기: [],
//   믹서기: [],
//   오븐: [],
//   전자레인지: [],
//   에어프라이어: []
// };

export default function AdminDashboard() {
  const [selectedCategory, setSelectedCategory] = useState("전기밥솥");
  const [products, setProducts] = useState([]);

  const [manufacturer, setManufacturer] = useState("");
  const [productName, setProductName] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
      adminService.getProducts(selectedCategory)
        .then(res => {
          setProducts(prev => ({
            ...prev,
            [selectedCategory]: res.data
          }));
        })
        .catch(err => console.error("제품 조회 실패:", err));
  }, [selectedCategory]);

  const handleAddProduct = (e) => {
    e.preventDefault();

    if (!manufacturer || !productName || !file) {
      alert("모든 필드를 입력하세요.");
      return;
    }

    const tempId = Date.now();
    const newItem = {
      id: tempId,
      productName: productName,
      manufacturer,
      fileName: file.name,
      uploadStatus: '저장 중'
    };

    setProducts(prev => ({
      ...prev,
      [selectedCategory]: [...prev[selectedCategory], newItem]
    }));

    const formData = new FormData();
      formData.append("applianceType", selectedCategory);
      formData.append("manufacturer", manufacturer);
      formData.append("productName", productName);
      formData.append("totalPages", 0);
      formData.append("file", file);
  
    adminService.addCookBook(formData)
          .then(res => {
              setProducts(prev => ({
                ...prev,
                [selectedCategory]: res.data
              }));
                  
            console.log("업로드 성공:", res.data)
          })
          .catch(err => {
            setProducts(prev => {
              const updated = {...prev};
              updated[selectedCategory] = updated[selectedCategory].map(item =>
                item.id === tempId? {...item, status: '실패'}: item
              );
              return updated;
            });
            console.error("에러 발생:", err)
          })
  


    setManufacturer("");
    setProductName("");
    setFile(null);
  };

  return (
    <div className="admin-container">
      
      {/* 1. 카테고리 선택 */}
      <div>
        <label className="label-title">가전 제품 선택</label>
        <select
          className="input-select"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* 2. 제품 등록 폼 */}
      <div className="card">
        <h2 className="section-title">📥 제품 등록</h2>

        <form onSubmit={handleAddProduct} className="form">
          <div>
            <label className="label">제조사</label>
            <input
              type="text"
              className="input-text"
              value={manufacturer}
              onChange={e => setManufacturer(e.target.value)}
            />
          </div>

          <div>
            <label className="label">제품명</label>
            <input
              type="text"
              className="input-text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
          </div>

          <div>
            <label className="label">파일 업로드 (PDF)</label>
            <input
              type="file"
              className="input-file"
              accept="application/pdf"
              onChange={e => setFile(e.target.files[0])}
            />
          </div>

          <button type="submit" className="btn-submit">
            등록하기
          </button>
        </form>
      </div>

      {/* 3. 대시보드 */}
      <div className="card">
        <h2 className="section-title">📊 {selectedCategory} 등록 목록</h2>

        {!products[selectedCategory] ? ( <div className="empty-text">Loading....</div>) :
           products[selectedCategory] .length === 0 ? (
          <div className="empty-text">등록된 제품이 없습니다.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>제품명</th>
                <th>제조사</th>
                <th>파일명</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {products[selectedCategory].map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.productName}</td>
                  <td>{item.manufacturer}</td>
                  <td>{item.fileName}</td>
                   <td>
                      <span
                        style={{
                          color:
                            item.uploadStatus === "저장 중"
                              ? "orange"
                              : item.uploadStatus === "UPLOADED"
                              ? "green"
                              : "red"
                        }}
                      >
                        {item.uploadStatus}
                      </span>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
