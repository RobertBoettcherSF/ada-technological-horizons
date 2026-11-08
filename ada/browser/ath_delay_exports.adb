with Ath_Delay;

package body Ath_Delay_Exports is
   use type Ath_Delay.Status_Code;

   Stored_One_Way : Long_Float := 0.0;
   Stored_Round   : Long_Float := 0.0;

   procedure Clear is
   begin
      Stored_One_Way := 0.0;
      Stored_Round := 0.0;
   end Clear;

   function Ath_Delay_F64
     (Distance, Unit : Long_Float) return Interfaces.Integer_32
   is
      One_Way    : Long_Float;
      Round_Trip : Long_Float;
      Status     : Ath_Delay.Status_Code;
   begin
      Ath_Delay.Propagate (Distance, Unit, One_Way, Round_Trip, Status);
      if Status = Ath_Delay.Ok then
         Stored_One_Way := One_Way;
         Stored_Round := Round_Trip;
      else
         Clear;
      end if;
      return Interfaces.Integer_32 (Status);
   end Ath_Delay_F64;

   function Ath_Delay_One_Way return Long_Float is
   begin
      return Stored_One_Way;
   end Ath_Delay_One_Way;

   function Ath_Delay_Round_Trip return Long_Float is
   begin
      return Stored_Round;
   end Ath_Delay_Round_Trip;

   function Ath_Delay_Event_Count return Interfaces.Integer_32 is
   begin
      return 3;
   end Ath_Delay_Event_Count;

   function Ath_Delay_Event_Time
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      case Index is
         when 1 =>
            return 0.0;
         when 2 =>
            return Stored_One_Way;
         when 3 =>
            return Stored_Round;
         when others =>
            return 0.0;
      end case;
   end Ath_Delay_Event_Time;

   function Ath_Delay_Preset_Count return Interfaces.Integer_32 is
   begin
      return Ath_Delay.Preset_Count;
   end Ath_Delay_Preset_Count;

   function Ath_Delay_Preset_Distance
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 or else Index > Ath_Delay.Preset_Count then
         return 0.0;
      end if;
      return Ath_Delay.Preset_Distance (Integer (Index));
   end Ath_Delay_Preset_Distance;

   function Ath_Delay_Preset_Unit
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 or else Index > Ath_Delay.Preset_Count then
         return -1.0;
      end if;
      return Ath_Delay.Preset_Unit (Integer (Index));
   end Ath_Delay_Preset_Unit;
end Ath_Delay_Exports;
