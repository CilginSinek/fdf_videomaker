# FFmpeg kontrol ve kurulum
FFMPEG_DIR = ./ffmpeg
FFMPEG_EXE = $(FFMPEG_DIR)/ffmpeg

all: check_ffmpeg install_node

check_ffmpeg:
	@if [ -f "$(FFMPEG_EXE)" ]; then \
		echo "FFmpeg bulundu: $(FFMPEG_EXE)"; \
	else \
		echo "FFmpeg bulunamadi, yerel dizine indiriliyor..." && $(MAKE) install_ffmpeg; \
	fi

install_node:
	@echo "Node.js kurulumu yapiliyor..."
	@if [ -d "node_modules" ]; then \
		echo "node_modules zaten mevcut, yukleme atlandi."; \
	else \
		npm install; \
	fi

install_ffmpeg:
	@echo "FFmpeg portable surumu indiriliyor..."
	@mkdir -p "$(FFMPEG_DIR)"
	@mkdir -p temp_extract
	@echo "Indirme baslatiliyor... (Bu islem biraz zaman alabilir)"
	@wget -q --show-progress "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz" -O ffmpeg_temp.tar.xz || \
		(echo "Hata: FFmpeg indirilemedi. Internet baglantinizi kontrol edin." && exit 1)
	@echo "Indirme tamamlandi, dosyalar cikartiliyor..."
	@tar -xf ffmpeg_temp.tar.xz -C temp_extract --strip-components=1
	@cp temp_extract/bin/ffmpeg "$(FFMPEG_DIR)/"
	@cp temp_extract/bin/ffprobe "$(FFMPEG_DIR)/"
	@chmod +x "$(FFMPEG_DIR)/ffmpeg" "$(FFMPEG_DIR)/ffprobe"
	@rm -rf temp_extract ffmpeg_temp.tar.xz
	@echo "FFmpeg basariyla kuruldu: $(FFMPEG_DIR)"

clean:
	@rm -f $(NAME)
	@rm -rf "$(FFMPEG_DIR)"
	@echo "Temizlik tamamlandi."

fclean: clean
	@rm -rf node_modules package-lock.json
	@echo "Derin temizlik tamamlandi."


.PHONY: all check_ffmpeg install_ffmpeg clean fclean

