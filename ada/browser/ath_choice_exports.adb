with Ath_Choice;

package body Ath_Choice_Exports is
   use type Ath_Choice.Status_Code;

   Stored_Bits : Long_Float := 0.0;
   Stored_Total : Long_Float := 0.0;
   Stored_Code : Long_Float := 0.0;
   Stored_Code_Total : Long_Float := 0.0;
   Stored_Code_Total_Valid : Boolean := False;
   Stored_Count : Long_Float := 0.0;
   Stored_Count_Valid : Boolean := False;
   Stored_Count_Exact : Boolean := False;
   Stored_Log10 : Long_Float := 0.0;
   Stored_X : Long_Float := 0.0;
   Stored_Y : Long_Float := 0.0;
   Stored_Repeats : Ath_Choice.Sample_Repeats := (others => 0.0);
   Stored_Totals : Ath_Choice.Sample_Bits := (others => 0.0);
   Stored_Ready : Boolean := False;

   function Flag (Value : Boolean) return Interfaces.Integer_32 is
   begin
      if Value then
         return 1;
      end if;
      return 0;
   end Flag;

   procedure Clear is
   begin
      Stored_Bits := 0.0;
      Stored_Total := 0.0;
      Stored_Code := 0.0;
      Stored_Code_Total := 0.0;
      Stored_Code_Total_Valid := False;
      Stored_Count := 0.0;
      Stored_Count_Valid := False;
      Stored_Count_Exact := False;
      Stored_Log10 := 0.0;
      Stored_X := 0.0;
      Stored_Y := 0.0;
      Stored_Repeats := (others => 0.0);
      Stored_Totals := (others => 0.0);
      Stored_Ready := False;
   end Clear;

   function Ath_Choice_F64
     (Possibilities, Repeats : Long_Float) return Interfaces.Integer_32 is
      Status : Ath_Choice.Status_Code;
   begin
      Ath_Choice.Choose
        (Possibilities, Repeats,
         Stored_Bits, Stored_Total, Stored_Code, Stored_Code_Total,
         Stored_Count, Stored_Log10,
         Stored_Count_Valid, Stored_Count_Exact, Stored_Code_Total_Valid,
         Stored_X, Stored_Y, Stored_Repeats, Stored_Totals, Status);
      Stored_Ready := Status = Ath_Choice.Ok;
      if not Stored_Ready then
         Clear;
      end if;
      return Interfaces.Integer_32 (Status);
   end Ath_Choice_F64;

   function Ath_Choice_Bits_Per return Long_Float is
   begin
      return Stored_Bits;
   end Ath_Choice_Bits_Per;

   function Ath_Choice_Total_Bits return Long_Float is
   begin
      return Stored_Total;
   end Ath_Choice_Total_Bits;

   function Ath_Choice_Code_Per return Long_Float is
   begin
      return Stored_Code;
   end Ath_Choice_Code_Per;

   function Ath_Choice_Code_Total return Long_Float is
   begin
      return Stored_Code_Total;
   end Ath_Choice_Code_Total;

   function Ath_Choice_Code_Total_Valid return Interfaces.Integer_32 is
   begin
      return Flag (Stored_Code_Total_Valid);
   end Ath_Choice_Code_Total_Valid;

   function Ath_Choice_Combinations return Long_Float is
   begin
      return Stored_Count;
   end Ath_Choice_Combinations;

   function Ath_Choice_Combinations_Valid return Interfaces.Integer_32 is
   begin
      return Flag (Stored_Count_Valid);
   end Ath_Choice_Combinations_Valid;

   function Ath_Choice_Combinations_Exact return Interfaces.Integer_32 is
   begin
      return Flag (Stored_Count_Exact);
   end Ath_Choice_Combinations_Exact;

   function Ath_Choice_Log10_Count return Long_Float is
   begin
      return Stored_Log10;
   end Ath_Choice_Log10_Count;

   function Ath_Choice_X_Max return Long_Float is
   begin
      return Stored_X;
   end Ath_Choice_X_Max;

   function Ath_Choice_Y_Max return Long_Float is
   begin
      return Stored_Y;
   end Ath_Choice_Y_Max;

   function Ath_Choice_Sample_Count return Interfaces.Integer_32 is
   begin
      if Stored_Ready then
         return Ath_Choice.Sample_Count;
      end if;
      return 0;
   end Ath_Choice_Sample_Count;

   function Ath_Choice_Sample_Repeat
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Stored_Ready or else Index < 1 or else Index > Ath_Choice.Sample_Count then
         return 0.0;
      end if;
      return Stored_Repeats (Integer (Index));
   end Ath_Choice_Sample_Repeat;

   function Ath_Choice_Sample_Bits
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Stored_Ready or else Index < 1 or else Index > Ath_Choice.Sample_Count then
         return 0.0;
      end if;
      return Stored_Totals (Integer (Index));
   end Ath_Choice_Sample_Bits;
end Ath_Choice_Exports;
