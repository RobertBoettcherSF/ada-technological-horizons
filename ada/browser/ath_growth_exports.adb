with Ath_Growth;

package body Ath_Growth_Exports is
   use type Ath_Growth.Status_Code;

   Stored_Quantity : Long_Float := 0.0;
   Stored_Factor   : Long_Float := 0.0;
   Stored_Times    : Ath_Growth.Sample_Times := (others => 0.0);
   Stored_Values   : Ath_Growth.Sample_Quantities := (others => 0.0);

   function Ath_Growth_F64
     (Initial, Doubling, Elapsed : Long_Float) return Interfaces.Integer_32
   is
      Quantity   : Long_Float;
      Factor     : Long_Float;
      Times      : Ath_Growth.Sample_Times;
      Quantities : Ath_Growth.Sample_Quantities;
      Status     : Ath_Growth.Status_Code;
   begin
      Ath_Growth.Grow
        (Initial, Doubling, Elapsed, Quantity, Factor, Times, Quantities, Status);
      if Status = Ath_Growth.Ok then
         Stored_Quantity := Quantity;
         Stored_Factor := Factor;
         Stored_Times := Times;
         Stored_Values := Quantities;
      else
         Stored_Quantity := 0.0;
         Stored_Factor := 0.0;
         Stored_Times := (others => 0.0);
         Stored_Values := (others => 0.0);
      end if;
      return Interfaces.Integer_32 (Status);
   end Ath_Growth_F64;

   function Ath_Growth_Quantity return Long_Float is
   begin
      return Stored_Quantity;
   end Ath_Growth_Quantity;

   function Ath_Growth_Factor return Long_Float is
   begin
      return Stored_Factor;
   end Ath_Growth_Factor;

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
end Ath_Growth_Exports;
