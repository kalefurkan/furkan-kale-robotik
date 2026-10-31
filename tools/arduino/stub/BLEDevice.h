#pragma once
// ELLE YAZILMIŞ SAHTE BAŞLIK (ESP32 Arduino çekirdeğinin BLE API'sinin kullanılan kısmının tahmini imzaları).
// Gerçek ESP32 çekirdeğiyle derlenmedi; yalnızca söz dizimi denetimi içindir.
#include "Arduino.h"
#include <string>
class BLE2902 { };
class BLECharacteristic;
class BLECharacteristicCallbacks { public: virtual ~BLECharacteristicCallbacks() {} virtual void onWrite(BLECharacteristic *) {} };
class BLEDescriptor { };
class BLECharacteristic {
 public:
  static const uint32_t PROPERTY_READ = 1, PROPERTY_WRITE = 2, PROPERTY_NOTIFY = 4, PROPERTY_WRITE_NR = 8;
  std::string getValue(); void setValue(uint8_t *, size_t); void setValue(const std::string &); void notify();
  void setCallbacks(BLECharacteristicCallbacks *); void addDescriptor(BLE2902 *);
};
class BLEService { public: BLECharacteristic *createCharacteristic(const char *, uint32_t); void start(); };
class BLEServer;
class BLEServerCallbacks { public: virtual ~BLEServerCallbacks() {} virtual void onConnect(BLEServer *) {} virtual void onDisconnect(BLEServer *) {} };
class BLEAdvertising { public: void addServiceUUID(const char *); void setScanResponse(bool); };
class BLEServer { public: void setCallbacks(BLEServerCallbacks *); BLEService *createService(const char *); };
class BLEDevice { public: static void init(const char *); static BLEServer *createServer(); static BLEAdvertising *getAdvertising(); static void startAdvertising(); };
