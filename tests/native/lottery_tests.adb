with Ada.Command_Line;
with Ada.Text_IO;
with Ada.Unchecked_Conversion;
with Interfaces;
with Ath_Lottery;
with Ath_Lottery_Exports;

procedure Lottery_Tests is
   use type Interfaces.Integer_32;
   use type Ath_Lottery.Status_Code;

   Failures : Natural := 0;

   procedure Fail (Name : String) is
   begin
      Failures := Failures + 1;
      Ada.Text_IO.Put_Line ("FAIL " & Name);
   end Fail;

   procedure Check
     (Name : String;
      Tickets, Prizes, Bought : Long_Float;
      Expected_Status : Ath_Lottery.Status_Code;
      Expect_Value : Long_Float := 0.0;
      Check_Expected : Boolean := False;
      Expect_Num : Long_Float := 0.0;
      Expect_Den : Long_Float := 1.0;
      Check_Fraction : Boolean := False;
      Expect_Log10 : Long_Float := 0.0;
      Check_Log10 : Boolean := False;
      Expect_Too_Small : Boolean := False;
      Expect_Zero : Boolean := False) is
      Expected, None_Value, None_Log10, At_Least : Long_Float;
      Representable, Exact_Zero, At_Least_Exact, Fraction_Valid : Boolean;
      Num, Den, X_Max, Expected_Max : Long_Float;
      Used : Interfaces.Integer_32;
      Bought_Out, Expected_Out, Chance_Out : Ath_Lottery.Sample_Values;
      Kinds : Ath_Lottery.Sample_Kinds;
      Status : Ath_Lottery.Status_Code;
   begin
      Ath_Lottery.Draw
        (Tickets, Prizes, Bought,
         Expected, None_Value, None_Log10, At_Least,
         Representable, Exact_Zero, At_Least_Exact, Fraction_Valid,
         Num, Den, X_Max, Expected_Max, Used,
         Bought_Out, Expected_Out, Chance_Out, Kinds, Status);
      if Status /= Expected_Status then
         Fail (Name & " status");
         return;
      end if;
      if Expected_Status /= Ath_Lottery.Ok then
         return;
      end if;
      if Check_Expected and then abs (Expected - Expect_Value) > 1.0e-9 then
         Ada.Text_IO.Put_Line (Name & " expected" & Expected'Image);
         Fail (Name & " expected");
      end if;
      if Check_Fraction and then
        (not Fraction_Valid or else Num /= Expect_Num or else Den /= Expect_Den)
      then
         Ada.Text_IO.Put_Line (Name & " fraction" & Num'Image & Den'Image);
         Fail (Name & " fraction");
      end if;
      if Check_Log10 and then abs (None_Log10 - Expect_Log10) > 1.0e-6 then
         Ada.Text_IO.Put_Line (Name & " log10" & None_Log10'Image);
         Fail (Name & " log10");
      end if;
      if Expect_Too_Small and then (Representable or else Exact_Zero) then
         Fail (Name & " too-small");
      end if;
      if Expect_Zero and then not Exact_Zero then
         Fail (Name & " exact-zero");
      end if;
      if Bought_Out (1) /= 0.0 or else Bought_Out (Natural (Used)) /= Tickets then
         Fail (Name & " axis");
      end if;
   end Check;
begin
   Check ("small", 10.0, 2.0, 3.0, Ath_Lottery.Ok,
          Expect_Value => 0.6, Check_Expected => True,
          Expect_Num => 7.0, Expect_Den => 15.0, Check_Fraction => True);
   Check ("book", 1_000_000.0, 1_000.0, 500_000.0, Ath_Lottery.Ok,
          Expect_Value => 500.0, Check_Expected => True,
          Expect_Log10 => -301.247142832478, Check_Log10 => True);
   Check ("underflow", 1_000_000.0, 5_000.0, 500_000.0, Ath_Lottery.Ok,
          Expect_Value => 2_500.0, Check_Expected => True,
          Expect_Log10 => -1_510.604868167756, Check_Log10 => True,
          Expect_Too_Small => True);
   Check ("stirling", 1_000_000.0, 10_000.0, 500_000.0, Ath_Lottery.Ok,
          Expect_Value => 5_000.0, Check_Expected => True,
          Expect_Log10 => -3_032.232189829539, Check_Log10 => True,
          Expect_Too_Small => True);
   Check ("buy-none", 10.0, 2.0, 0.0, Ath_Lottery.Ok,
          Expect_Value => 0.0, Check_Expected => True,
          Expect_Num => 1.0, Expect_Den => 1.0, Check_Fraction => True);
   Check ("no-prizes", 10.0, 0.0, 4.0, Ath_Lottery.Ok,
          Expect_Value => 0.0, Check_Expected => True,
          Expect_Num => 1.0, Expect_Den => 1.0, Check_Fraction => True);
   Check ("buy-all", 10.0, 2.0, 10.0, Ath_Lottery.Ok,
          Expect_Value => 2.0, Check_Expected => True, Expect_Zero => True);
   Check ("must-hit", 10.0, 2.0, 9.0, Ath_Lottery.Ok,
          Expect_Value => 1.8, Check_Expected => True, Expect_Zero => True);
   Check ("all-win-none-bought", 10.0, 10.0, 0.0, Ath_Lottery.Ok,
          Expect_Num => 1.0, Expect_Den => 1.0, Check_Fraction => True);
   Check ("all-win-one", 10.0, 10.0, 1.0, Ath_Lottery.Ok, Expect_Zero => True);
   Check ("no-tickets", 0.0, 0.0, 0.0, Ath_Lottery.Tickets_Not_Positive);
   Check ("too-many-prizes", 10.0, 11.0, 1.0, Ath_Lottery.Prizes_Out_Of_Range);
   Check ("too-many-bought", 10.0, 2.0, 11.0, Ath_Lottery.Bought_Out_Of_Range);
   Check ("negative-prizes", 10.0, -1.0, 1.0, Ath_Lottery.Prizes_Out_Of_Range);
   Check ("fraction", 10.0, 2.0, 2.5, Ath_Lottery.Not_Integer);
   Check ("wide", 2.0 ** 53 + 2.0, 1.0, 1.0, Ath_Lottery.Out_Of_Range);
   declare
      type Word is mod 2 ** 64;
      function To_Float is new Ada.Unchecked_Conversion (Word, Long_Float);
   begin
      Check ("nan", To_Float (16#7FF8_0000_0000_0001#), 1.0, 1.0, Ath_Lottery.Non_Finite_Input);
   end;

   if Ath_Lottery_Exports.Ath_Lottery_F64 (10.0, 2.0, 3.0) /= 0
     or else abs (Ath_Lottery_Exports.Ath_Lottery_Expected - 0.6) > 1.0e-9
     or else Ath_Lottery_Exports.Ath_Lottery_Fraction_Num /= 7.0
     or else Ath_Lottery_Exports.Ath_Lottery_Fraction_Den /= 15.0
     or else Ath_Lottery_Exports.Ath_Lottery_Sample_Count /= 11
     or else Ath_Lottery_Exports.Ath_Lottery_Sample_Kind (10) /= Ath_Lottery.Kind_Exact_Zero
     or else Ath_Lottery_Exports.Ath_Lottery_Sample_Bought (1) /= 0.0
     or else Ath_Lottery_Exports.Ath_Lottery_Sample_Bought (11) /= 10.0
   then
      Fail ("export-small");
   end if;
   if Ath_Lottery_Exports.Ath_Lottery_F64 (0.0, 1.0, 0.0) /= 3
     or else Ath_Lottery_Exports.Ath_Lottery_Sample_Count /= 0
     or else Ath_Lottery_Exports.Ath_Lottery_Expected /= 0.0
   then
      Fail ("export-cleared");
   end if;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("LOTTERY OK");
   else
      Ada.Text_IO.Put_Line ("LOTTERY FAILURES" & Failures'Image);
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Lottery_Tests;
