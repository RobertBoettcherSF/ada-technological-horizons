with Ath_Growth;

package body Ath_Growth_Exports is
   use type Ath_Growth.Status_Code;

   Stored_Quantity : Long_Float := 0.0;
   Stored_Factor   : Long_Float := 0.0;
   Stored_End_Year : Long_Float := 0.0;
   Stored_Baseline_Status : Interfaces.Integer_32 := 0;
   Stored_Times    : Ath_Growth.Sample_Times := (others => 0.0);
   Stored_Values   : Ath_Growth.Sample_Quantities := (others => 0.0);
   Stored_Baseline : Ath_Growth.Sample_Quantities := (others => 0.0);
   Stored_Target_Elapsed : Long_Float := 0.0;
   Stored_Target_Year    : Long_Float := 0.0;

   procedure Clear_Curve is
   begin
      Stored_Quantity := 0.0;
      Stored_Factor := 0.0;
      Stored_End_Year := 0.0;
      Stored_Baseline_Status := 0;
      Stored_Times := (others => 0.0);
      Stored_Values := (others => 0.0);
      Stored_Baseline := (others => 0.0);
   end Clear_Curve;

   function Ath_Growth_F64
     (Initial, Doubling, Elapsed, Start_Year : Long_Float)
      return Interfaces.Integer_32
   is
      Quantity        : Long_Float;
      Factor          : Long_Float;
      End_Year        : Long_Float;
      Times           : Ath_Growth.Sample_Times;
      Model           : Ath_Growth.Sample_Quantities;
      Baseline        : Ath_Growth.Sample_Quantities;
      Growth_Status   : Ath_Growth.Status_Code;
      Baseline_Status : Ath_Growth.Status_Code;
   begin
      Ath_Growth.Chart
        (Initial, Doubling, Elapsed, Start_Year, Quantity, Factor, End_Year,
         Times, Model, Baseline, Growth_Status, Baseline_Status);
      if Growth_Status = Ath_Growth.Ok then
         Stored_Quantity := Quantity;
         Stored_Factor := Factor;
         Stored_End_Year := End_Year;
         Stored_Baseline_Status := Interfaces.Integer_32 (Baseline_Status);
         Stored_Times := Times;
         Stored_Values := Model;
         Stored_Baseline := Baseline;
      else
         Clear_Curve;
      end if;
      return Interfaces.Integer_32 (Growth_Status);
   end Ath_Growth_F64;

   function Ath_Growth_Quantity return Long_Float is
   begin
      return Stored_Quantity;
   end Ath_Growth_Quantity;

   function Ath_Growth_Factor return Long_Float is
   begin
      return Stored_Factor;
   end Ath_Growth_Factor;

   function Ath_Growth_End_Year return Long_Float is
   begin
      return Stored_End_Year;
   end Ath_Growth_End_Year;

   function Ath_Growth_Baseline_Status return Interfaces.Integer_32 is
   begin
      return Stored_Baseline_Status;
   end Ath_Growth_Baseline_Status;

   function Ath_Growth_Sample_Count return Interfaces.Integer_32 is
   begin
      return Ath_Growth.Sample_Count;
   end Ath_Growth_Sample_Count;

   function Ath_Growth_Sample_Time
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 or else Index > Ath_Growth.Sample_Count then
         return 0.0;
      end if;
      return Stored_Times (Integer (Index));
   end Ath_Growth_Sample_Time;

   function Ath_Growth_Sample_Quantity
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 or else Index > Ath_Growth.Sample_Count then
         return 0.0;
      end if;
      return Stored_Values (Integer (Index));
   end Ath_Growth_Sample_Quantity;

   function Ath_Growth_Sample_Baseline
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 or else Index > Ath_Growth.Sample_Count then
         return 0.0;
      end if;
      return Stored_Baseline (Integer (Index));
   end Ath_Growth_Sample_Baseline;

   function Ath_Growth_Target_F64
     (Initial, Doubling, Elapsed, Start_Year, Target : Long_Float)
      return Interfaces.Integer_32
   is
      Cross_Time : Long_Float;
      Cross_Year : Long_Float;
      Status     : Ath_Growth.Target_Code;
   begin
      Ath_Growth.Crossing
        (Initial, Doubling, Elapsed, Start_Year, Target,
         Cross_Time, Cross_Year, Status);
      Stored_Target_Elapsed := Cross_Time;
      Stored_Target_Year := Cross_Year;
      return Interfaces.Integer_32 (Status);
   end Ath_Growth_Target_F64;

   function Ath_Growth_Target_Elapsed return Long_Float is
   begin
      return Stored_Target_Elapsed;
   end Ath_Growth_Target_Elapsed;

   function Ath_Growth_Target_Year return Long_Float is
   begin
      return Stored_Target_Year;
   end Ath_Growth_Target_Year;
end Ath_Growth_Exports;
