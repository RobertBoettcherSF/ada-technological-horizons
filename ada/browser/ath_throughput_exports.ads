with Interfaces;

--  Fixed-width constant-rate export. A rejected input clears every result.
--  Unreachable and indeterminate leave the time invalid and keep a total.
package Ath_Throughput_Exports is
   function Ath_Throughput_F64
     (Quantity, Quantity_Unit, Rate, Rate_Unit, Bound, Duration, Duration_Unit : Long_Float)
      return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_throughput_f64";

   function Ath_Throughput_Time_Valid return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_throughput_time_valid";

   function Ath_Throughput_Time return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_time";

   function Ath_Throughput_Time_Upper return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_throughput_time_upper";

   function Ath_Throughput_Total_Valid return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_throughput_total_valid";

   function Ath_Throughput_Total return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_total";

   function Ath_Throughput_Total_Lower return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_throughput_total_lower";

   function Ath_Throughput_Chart_Valid return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_throughput_chart_valid";

   function Ath_Throughput_Human return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_human";

   function Ath_Throughput_Bacterial return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_bacterial";

   function Ath_Throughput_Ratio return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_ratio";

   function Ath_Throughput_Quantity_Bits return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_quantity_bits";

   function Ath_Throughput_Rate_Bits return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_rate_bits";

   function Ath_Throughput_Preset_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_throughput_preset_count";

   function Ath_Throughput_Preset_Quantity
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_preset_quantity";

   function Ath_Throughput_Preset_Quantity_Unit
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_preset_quantity_unit";

   function Ath_Throughput_Preset_Rate
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_preset_rate";

   function Ath_Throughput_Preset_Rate_Unit
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_preset_rate_unit";

   function Ath_Throughput_Preset_Bound
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_preset_bound";

   function Ath_Throughput_Preset_Sets_Quantity
     (Index : Interfaces.Integer_32) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_throughput_preset_sets_quantity";

   function Ath_Throughput_Preset_Sets_Rate
     (Index : Interfaces.Integer_32) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_throughput_preset_sets_rate";

   function Ath_Throughput_Human_Rate return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_human_rate";

   function Ath_Throughput_Bacterial_Rate return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_bacterial_rate";

   function Ath_Throughput_Link_Rate return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_link_rate";

   function Ath_Throughput_Human_Linear return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_human_linear";

   function Ath_Throughput_Bacterial_Linear return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_bacterial_linear";

   function Ath_Throughput_Human_Log return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_human_log";

   function Ath_Throughput_Bacterial_Log return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_bacterial_log";

   function Ath_Throughput_Link_Log return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_link_log";

   function Ath_Throughput_Link_Time return Long_Float
   with Export, Convention => C, External_Name => "ath_throughput_link_time";

   function Ath_Throughput_Link_Valid return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_throughput_link_valid";
end Ath_Throughput_Exports;
