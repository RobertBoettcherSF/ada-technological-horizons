with Interfaces;

--  Fixed-width light-time export. A non-zero status clears both delays and
--  every timeline event. Event indexes are 1 send, 2 arrival, 3 reply.
package Ath_Delay_Exports is
   function Ath_Delay_F64
     (Distance, Unit : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_delay_f64";

   function Ath_Delay_One_Way return Long_Float
   with Export, Convention => C, External_Name => "ath_delay_one_way";

   function Ath_Delay_Round_Trip return Long_Float
   with Export, Convention => C, External_Name => "ath_delay_round_trip";

   function Ath_Delay_Event_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_delay_event_count";

   function Ath_Delay_Event_Time
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_delay_event_time";

   function Ath_Delay_Preset_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_delay_preset_count";

   function Ath_Delay_Preset_Distance
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_delay_preset_distance";

   function Ath_Delay_Preset_Unit
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_delay_preset_unit";

   function Ath_Delay_Leg_Time
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_delay_leg_time";
end Ath_Delay_Exports;
