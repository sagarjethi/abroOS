# TrustZone App Makefile

CC = gcc
CFLAGS = -Wall -Wextra -O2
TARGET = trustzone_app

SRCS = trustzone_app.c
OBJS = $(SRCS:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

install: $(TARGET)
	@echo "Installing TrustZone app..."
	@mkdir -p $(DESTDIR)/usr/local/bin
	@cp $(TARGET) $(DESTDIR)/usr/local/bin/
	@echo "TrustZone app installed successfully"

clean:
	@echo "Cleaning TrustZone app..."
	@rm -f $(OBJS) $(TARGET)
	@echo "Clean complete"

.PHONY: all install clean
