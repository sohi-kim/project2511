package com.kitchen.recipe.service;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.util.List;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import com.kitchen.recipe.entity.ApplianceRecipe;
import com.kitchen.recipe.repository.ApplianceRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Transactional
@Slf4j
@Service
@RequiredArgsConstructor
public class RecipeService {

    private final ApplianceRepository repository;
    private final WebClient webClient = WebClient.create("http://localhost:8000");
    private static final String SAVE_DIR = "/home/sohkim/rbook";  // 저장 위치

   public List<ApplianceRecipe> getProductsByCategory(String category) {
    return repository.findByApplianceType(category)
            .stream()
            .map(book -> ApplianceRecipe.builder()
                    .id(book.getId())
                    .applianceType(book.getApplianceType())
                    .fileName(book.getFileName())
                    .manufacturer(book.getManufacturer())
                    .productName(book.getProductName())
                    .totalPages(book.getTotalPages())
                    .uploadStatus(book.getUploadStatus())
                    .build())
            .toList();
    }


    public ApplianceRecipe processUpload(String applianceType,
                              String manufacturer,
                              String productName,
                              int totalPages,
                              MultipartFile file) {

        String fileName = manufacturer + "_" + productName + ".pdf";
       
        String fileHashString = savePdfFile(file, fileName); 
        File saveFile = new File(SAVE_DIR, fileName);    
       

            // 1️⃣ DB 저장
          ApplianceRecipe recipe = ApplianceRecipe.builder()
                    .applianceType(applianceType)
                    .manufacturer(manufacturer)
                    .productName(productName)
                    .fileName(fileName)
                    .totalPages(totalPages)
                    .fileHash(fileHashString)
                    .uploadStatus("UPLOADED")
                    .build();

            

            // 2️⃣ Python RAG 서버에 파일 전송
            webClient.post()
                    .uri("/ingest")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData("file",new FileSystemResource(saveFile))  // file.getResource()
                            .with("fileName", fileName)
                            .with("manufacturer", manufacturer)
                            .with("productName", productName)
                    )
                    .retrieve()
                    .bodyToMono(String.class)
                    .subscribe();
            
            return repository.save(recipe);        

    }

    private String savePdfFile(MultipartFile file, String fileName) {

        try {
                File dir = new File(SAVE_DIR);

                // 디렉터리 없으면 생성
                if (!dir.exists()) {
                dir.mkdirs();
                }

                // 저장 경로
                File saveFile = new File(dir, fileName);
                // file.transferTo(saveFile);   // 임시파일을 사용하므로 transferTo 가 move 하면 참조 오류 발생
                Files.copy(file.getInputStream(), saveFile.toPath(), StandardCopyOption.REPLACE_EXISTING);


                // 1️⃣ 파일 해시 계산 - 중복 파일 있으면 예외 발생 else 서버에 저장
                String hexString = generateFingerprintHash(saveFile);
                log.info("file hexString : {}",hexString);
                // 2️⃣ 중복 파일 체크
                repository.findByFileHash(hexString.toString()).ifPresent(existing -> {
                        saveFile.delete();
                        throw new RuntimeException("이미 업로드된 동일한 파일입니다. productName=" + existing.getProductName());
                });

                return hexString;
        } catch (IOException e) {
                throw new RuntimeException("PDF 저장 중 오류 발생: " + e.getMessage());
        }
    }

    private String generateFingerprintHash(File file) {

        // 1️⃣ RandomAccessFile로 접근
        try (RandomAccessFile raf = new RandomAccessFile(file, "r")) {

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
    } catch (Exception e) {
        file.delete();
        throw new RuntimeException("Fingerprint 계산 중 오류 발생: " + e.getMessage());
    }
}
}

