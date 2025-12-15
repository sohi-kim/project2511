import fitz   # pip install PyMuPDF
import pdfplumber   # pip install pdfplumber - 한글 최적
from io import BytesIO

import re
import pytesseract    # pip install pytesseract
from pdf2image import convert_from_bytes    # pip install pdf2image

# ------------------------------------------------------
# 1) CID 체크 + 한글 포함 여부 판별
# ------------------------------------------------------
def is_cid_text(text: str):
    # CID 패턴이 매우 반복되면 CIDFont 기반 PDF
    cid_pattern = r"\(cid:\d+\)"
    matches = re.findall(cid_pattern, text)
    
    # 전체 텍스트 중 상당 부분이 CID 패턴이면 텍스트 없는 PDF
    if len(matches) > 10 and len(matches) / max(1, len(text)) > 0.1:
        return True
    return False

def contains_korean(text):
    return any("\uac00" <= ch <= "\ud7a3" for ch in text)

# ------------------------------------------------------
# 2) PyMuPDF로 제목 후보(큰 글씨/Bold) 추출
# ------------------------------------------------------
def extract_title_candidates(pdf_bytes):
    """
    PDF에서 제목 후보를 추출합니다.
    - 큰 글씨 (평균 대비 큰 폰트)
    - 굵은 글씨 (bold/semibold)
    - 세로 방향 텍스트
    """
    doc = fitz.open("pdf", pdf_bytes)
    candidates = []
    all_font_sizes = []
    
    # 1단계: 전체 문서의 폰트 크기 수집 (평균 계산용)
    for page in doc:
        blocks = page.get_text("dict")["blocks"]
        for b in blocks:
            if "lines" not in b:
                continue
            for line in b["lines"]:
                for span in line["spans"]:
                    all_font_sizes.append(span["size"])
    
    # 평균 폰트 크기 계산
    avg_font_size = sum(all_font_sizes) / len(all_font_sizes) if all_font_sizes else 12
    threshold_size = avg_font_size * 1.3  # 평균보다 30% 큰 경우
    
    # 2단계: 제목 후보 추출
    for page in doc:
        blocks = page.get_text("dict")["blocks"]
        
        for b in blocks:
            if "lines" not in b:
                continue
            
            # 세로 방향 텍스트 감지 (bbox 비교)
            block_bbox = b.get("bbox", [0, 0, 0, 0])
            block_height = block_bbox[3] - block_bbox[1]
            block_width = block_bbox[2] - block_bbox[0]
            is_vertical = block_height > block_width * 1.5  # 세로가 가로보다 1.5배 이상 길면 세로 텍스트
            
            for line in b["lines"]:
                # 라인 전체 텍스트
                full_text = "".join([span["text"] for span in line["spans"]]).strip()
                
                if not full_text or not contains_korean(full_text):
                    continue
                
                # 라인의 평균 폰트 크기 및 굵기 확인
                max_size = max([span["size"] for span in line["spans"]])
                fonts = [span.get("font", "").lower() for span in line["spans"]]
                is_bold = any("bold" in f or "black" in f or "heavy" in f for f in fonts)
                
                # 제목 후보 조건
                is_large = max_size >= threshold_size
                is_short = 2 <= len(full_text) <= 50
                not_pure_number = not full_text.replace(" ", "").replace(".", "").isdigit()
                
                # 제목 후보로 추가
                if is_short and not_pure_number and (is_large or is_bold or is_vertical):
                    candidate_info = {
                        "text": full_text,
                        "size": max_size,
                        "is_bold": is_bold,
                        "is_vertical": is_vertical,
                        "is_large": is_large
                    }
                    candidates.append(candidate_info)
    
    # 중복 제거 (텍스트 기준)
    seen = set()
    unique_candidates = []
    for c in candidates:
        if c["text"] not in seen:
            seen.add(c["text"])
            unique_candidates.append(c)
    
    # 점수 기반 정렬 (큰 글씨 > 굵은 글씨 > 세로 방향)
    def score_candidate(c):
        score = 0
        if c["is_large"]: score += 3
        if c["is_bold"]: score += 2
        if c["is_vertical"]: score += 1
        return score
    
    unique_candidates.sort(key=score_candidate, reverse=True)
    
    return unique_candidates

# 사용 예시:
# candidates = extract_title_candidates(pdf_bytes)
# for c in candidates:
#     print(f"제목 후보: {c['text']} (크기: {c['size']:.1f}, Bold: {c['is_bold']}, 세로: {c['is_vertical']})")

# ---------------------------------------------------- 
def extract_title_candidates_s(pdf_bytes):
    doc = fitz.open("pdf", pdf_bytes)
    candidates = []

    for page in doc:
        blocks = page.get_text("dict")["blocks"]

        for b in blocks:
            if "lines" not in b:
                continue

            for line in b["lines"]:
                full_text = "".join([span["text"] for span in line["spans"]]).strip()
                for span in line["spans"]:
                    text = span["text"].strip()
                    size = span["size"]

                    # 제목 후보 규칙
                    if (
                        2 <= len(full_text) <= 12 and          # 짧은 텍스트
                        # size >= 12 and               # 큰 폰트
                        # not text.isdigit() and       # 숫자(10/6인용 등) 제외
                        contains_korean(full_text)        # 한글 포함
                    ):
                        candidates.append(full_text)

    return list(set(candidates))  # 중복 제거
# ------------------------ocr 기반 pdf
from io import BytesIO
import pdfplumber
import pytesseract
from pytesseract import Output

def contains_korean(text: str) -> bool:
    return bool(re.search(r"[가-힣]", text))

def extract_title_candidates_from_ocr_page(page, lang="kor"):
    """
    pdfplumber의 page 객체를 받아서
    OCR을 돌린 뒤, 제목 후보 텍스트 리스트를 반환.
    """
    # 1) 페이지를 이미지로 변환
    img = page.to_image(resolution=300).original

    # 2) OCR + bbox 정보까지 받기
    data = pytesseract.image_to_data(img, lang=lang, output_type=Output.DICT)

    n = len(data["text"])
    lines = {}  # key: (block_num, par_num, line_num) -> dict(text, max_h, top)

    for i in range(n):
        text = data["text"][i].strip()
        if not text:
            continue

        # OCR 신뢰도 너무 낮으면 버리기 (옵션)
        try:
            conf = float(data["conf"][i])
            if conf < 40:  # 0~100, 너무 낮은 건 버림
                continue
        except ValueError:
            pass

        block = data["block_num"][i]
        par   = data["par_num"][i]
        line  = data["line_num"][i]
        key   = (block, par, line)

        x = data["left"][i]
        y = data["top"][i]
        w = data["width"][i]
        h = data["height"][i]

        if key not in lines:
            lines[key] = {
                "text": text,
                "max_h": h,
                "top": y,
            }
        else:
            lines[key]["text"] += " " + text
            lines[key]["max_h"] = max(lines[key]["max_h"], h)
            lines[key]["top"] = min(lines[key]["top"], y)

    if not lines:
        return []

    # 3) 라인별 높이/위치 기반으로 제목 후보 필터링
    line_list = list(lines.values())
    heights = [ln["max_h"] for ln in line_list]
    max_h = max(heights)

    # 너무 작은 글자는 제외하고, 상단에 있는 한국어 라인 위주로
    title_candidates = []
    for ln in line_list:
        text = ln["text"].strip()
        h = ln["max_h"]
        top = ln["top"]

        # 제목 후보 heuristic
        if len(text) < 2 or len(text) > 30:
            continue
        if not contains_korean(text):
            continue
        if h < max_h * 0.4:  # 페이지에서 상대적으로 큰 글자만
            continue
        if top > 800:  # 너무 아래쪽에 있으면 제목일 가능성 낮다고 가정(값은 환경에 따라 조정)
            continue

        title_candidates.append(text)

    # 중복 제거
    title_candidates = list(dict.fromkeys(title_candidates))
    return title_candidates

# --------------------------
import re
import numpy as np
import cv2  # pip install opencv-python
import pytesseract
from pytesseract import Output

def bold_score(line_img):
    """
    글자 영역(line_img)의 '검은 비율'을 굵기 근사값으로 사용.
    값이 클수록 진하게(굵게) 보이는 경향이 있음.
    """
    gray = cv2.cvtColor(line_img, cv2.COLOR_BGR2GRAY)
    # OTSU 이진화 + 흰 바탕, 검은 글자라고 가정
    _, th = cv2.threshold(gray, 0, 255, cv2.THRESH_OTSU | cv2.THRESH_BINARY_INV)

    black_ratio = np.sum(th > 0) / th.size
    return black_ratio


def extract_title_candidates_from_ocr_page2(page, lang="kor+eng", page_top_limit=800):
    """
    pdfplumber의 page 객체를 받아서:
    1) OCR 수행
    2) 같은 라인에 있는 단어들을 하나로 합쳐서
    3) 제목 후보로 보이는 라인의 텍스트 리스트를 반환
    """
    # 1) PDF 페이지 → 이미지(PIL) → numpy (BGR)
    pil_img = page.to_image(resolution=300).original
    img_rgb = np.array(pil_img)
    img = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)

    # 2) OCR 데이터 (단어 단위)
    data = pytesseract.image_to_data(pil_img, lang=lang, output_type=Output.DICT)
    n = len(data["text"])

    # 3) 같은 라인(block, par, line)을 하나로 묶기
    lines = {}  # key: (block_num, par_num, line_num) -> {text, left, top, right, bottom}
    for i in range(n):
        text = data["text"][i].strip()
        if not text:
            continue

        # OCR 신뢰도 필터 (너무 낮은 건 버림 - 필요시 조정)
        try:
            conf = float(data["conf"][i])
            if conf < 40:
                continue
        except ValueError:
            pass

        block = data["block_num"][i]
        par   = data["par_num"][i]
        line  = data["line_num"][i]
        key   = (block, par, line)

        left = data["left"][i]
        top  = data["top"][i]
        w    = data["width"][i]
        h    = data["height"][i]
        right = left + w
        bottom = top + h

        if key not in lines:
            lines[key] = {
                "text": text,
                "left": left,
                "top": top,
                "right": right,
                "bottom": bottom,
            }
        else:
            # 같은 라인에 있는 단어들을 **하나의 문장(제목 후보)** 으로 합치기
            lines[key]["text"] += " " + text
            lines[key]["left"]   = min(lines[key]["left"], left)
            lines[key]["top"]    = min(lines[key]["top"], top)
            lines[key]["right"]  = max(lines[key]["right"], right)
            lines[key]["bottom"] = max(lines[key]["bottom"], bottom)

    if not lines:
        return []

    # 4) 각 라인에 대해 굵기 점수 / 높이 계산
    line_objs = []
    heights = []

    for ln in lines.values():
        x1, y1, x2, y2 = ln["left"], ln["top"], ln["right"], ln["bottom"]
        line_img = img[y1:y2, x1:x2]
        if line_img.size == 0:
            continue

        h = y2 - y1
        heights.append(h)

        score = bold_score(line_img)  # 굵기 근사치

        line_objs.append({
            "text": ln["text"].strip(),
            "height": h,
            "top": y1,
            "bold_score": score,
        })

    if not line_objs:
        return []

    max_h = max(heights)

    # 5) 제목 후보 필터링
    title_candidates = []
    for obj in line_objs:
        text = obj["text"]
        h    = obj["height"]
        top  = obj["top"]
        bsc  = obj["bold_score"]

        # 길이 필터 (너무 짧거나 너무 길면 제외)
        if len(text) < 2 or len(text) > 40:
            continue

        # 한글 포함 여부
        if not contains_korean(text):
            continue

        # 페이지에서 상대적으로 큰 글자만 (제목일 가능성 ↑)
        if h < max_h * 0.6:
            continue

        # 페이지 상단에 있는 텍스트일수록 제목일 가능성 ↑ (값은 PDF 해상도 따라 조정)
        if top > page_top_limit:
            continue

        # 여기서는 필터만 통과하면 후보로 추가
        title_candidates.append((text, bsc, h, top))

    # 6) 굵기/높이/위치 기준으로 정렬 후 텍스트만 추출
    title_candidates.sort(key=lambda x: (x[1], x[2], -x[3]), reverse=True)

    # 중복 제거하면서 텍스트만 리턴
    titles = []
    seen = set()
    for text, _, _, _ in title_candidates:
        if text not in seen:
            seen.add(text)
            titles.append(text)

    return titles

# ------------------------------------------------------
# 3) LLM으로 음식명만 필터링
# ------------------------------------------------------
async def filter_food_titles(candidates:str):
    if not candidates:
        return []

    prompt = f"""
다음 텍스트 목록은 PDF에서 추출된 굵은 글씨 또는 큰 폰트 후보들입니다.
이 중에서 '음식,디저트,음료,간식'만 골라서, 불필요한 기호 없이 깔끔한 리스트로 반환해 주세요.
리스트의 항목은 중복을 허용하지 않습니다.

후보 목록:
{candidates}

반환 형식:
기호 없이 한줄에 하나씩 음식명만
"""

    from openai import OpenAI
    client = OpenAI()

    res = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    output = res.choices[0].message.content.strip()
    return [line.strip() for line in output.split("\n") if line.strip()]