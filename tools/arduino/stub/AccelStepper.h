#pragma once
#include "Arduino.h"
class AccelStepper {
 public:
  enum MotorInterfaceType { FUNCTION = 0, DRIVER = 1, FULL2WIRE = 2, FULL3WIRE = 3, FULL4WIRE = 4, HALF3WIRE = 6, HALF4WIRE = 8 };
  AccelStepper(uint8_t interface = FULL4WIRE, uint8_t pin1 = 2, uint8_t pin2 = 3, uint8_t pin3 = 4, uint8_t pin4 = 5, bool enable = true);
  void moveTo(long absolute); void move(long relative); bool run(); bool runSpeed();
  void setMaxSpeed(float); float maxSpeed(); void setAcceleration(float); void setSpeed(float); float speed();
  long distanceToGo(); long targetPosition(); long currentPosition(); void setCurrentPosition(long);
  void runToPosition(); bool runSpeedToPosition(); void runToNewPosition(long); void stop();
  virtual void disableOutputs(); virtual void enableOutputs(); void setEnablePin(uint8_t = 0xff);
  void setPinsInverted(bool, bool, bool); void setMinPulseWidth(unsigned int); bool isRunning();
};
