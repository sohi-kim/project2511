package com.kitchen.recipe.service;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.security.MessageDigest;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import com.kitchen.recipe.entity.ApplianceRecipe;
import com.kitchen.recipe.repository.ApplianceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final ApplianceRepository repository;
    private final WebClient webClient = WebClient.create("http://python-rag-server:8000");
    private static final String SAVE_DIR = "/home/iclass/rbook";  // 저장 위치
    public void processUpload(String applianceType,
                              String manufacturer,
                              String productName,
                              int totalPages,
                              MultipartFile file) {

        String fileName = manufacturer + "_" + productName + ".pdf";

            // 1️⃣ 파일 해시 계산
        String fileHash = generateFingerprintHash(file);

        // 2️⃣ 중복 파일 체크
        repository.findByFileHash(fileHash).ifPresent(existing -> {
                throw new RuntimeException("이미 업로드된 동일한 파일입니다. productName=" + existing.getProductName());
        });

        // 1️⃣ 서버 로컬 경로에 PDF 저장
        savePdfFile(file, fileName);


        // 1️⃣ DB 저장
        ApplianceRecipe recipe = ApplianceRecipe.builder()
                .applianceType(applianceType)
                .manufacturer(manufacturer)
                .productName(productName)
                .fileName(fileName)
                .totalPages(totalPages)
                .uploadStatus("UPLOADED")
                .build();

        repository.save(recipe);

        // 2️⃣ Python RAG 서버에 파일 전송
        webClient.post()
                .uri("/ingest")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file.getResource())
                        .with("fileName", fileName)
                        .with("manufacturer", manufacturer)
                        .with("productName", productName)
                )
                .retrieve()
                .bodyToMono(String.class)
                .subscribe();

    }

        private void savePdfFile(MultipartFile file, String fileName) {

        try {
                File dir = new File(SAVE_DIR);

                // 디렉터리 없으면 생성
                if (!dir.exists()) {
                dir.mkdirs();
                }

                // 저장 경로
                File saveFile = new File(dir, fileName);

                // MultipartFile → 실제 파일 저장
                file.transferTo(saveFile);

                System.out.println("PDF 저장 완료: " + saveFile.getAbsolutePath());

        } catch (IOException e) {
                throw new RuntimeException("PDF 저장 중 오류 발생: " + e.getMessage());
        }
    }

    public String generateFingerprintHash(MultipartFile file) {

    try {
        // 0️⃣ MultipartFile → 임시 파일로 저장
        File tempFile = File.createTempFile("upload_", ".pdf");
        file.transferTo(tempFile);

        // 1️⃣ RandomAccessFile로 접근
        try (RandomAccessFile raf = new RandomAccessFile(tempFile, "r")) {

            long fileSize = raf.length();
            byte[] buffer = new byte[1024];  // 1KB
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            // --- 1️⃣ 앞 1KB ---
            int readBytes = raf.read(buffer);
            digest.update(buffer, 0, readBytes);

            // --- 2️⃣ 중간 1KB ---
            long midPos = Math.max(0, fileSize / 2);
            raf.seek(midPos);
            readBytes = raf.read(buffer);
            digest.update(buffer, 0, readBytes);

            // --- 3️⃣ 마지막 1KB ---
            long endPos = Math.max(0, fileSize - 1024);
            raf.seek(endPos);
            readBytes = raf.read(buffer);
            digest.update(buffer, 0, readBytes);

            // 🔥 최종 fingerprint hash 반환
            byte[] hashBytes = digest.digest();
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                hexString.append(String.format("%02x", b));
            }

            return hexString.toString();
        } finally {
            // 임시 파일 삭제
            tempFile.delete();
        }

    } catch (Exception e) {
        throw new RuntimeException("Fingerprint 계산 중 오류 발생: " + e.getMessage());
    }
}
}

